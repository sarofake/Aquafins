import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

/**
 * Constructs the Postgres connection string from environment variables.
 * Prefers SUPABASE_DB_SESSION_URL if provided directly.
 */
export function getDbConnectionString() {
  if (process.env.SUPABASE_DB_SESSION_URL) {
    return process.env.SUPABASE_DB_SESSION_URL;
  }

  const pass = process.env.SUPABASE_DB_PASSWORD;
  if (!pass) return null;

  const host = process.env.SUPABASE_DB_HOST || 'aws-0-ap-northeast-1.pooler.supabase.com';
  const port = process.env.SUPABASE_DB_PORT || '5432';
  const user = process.env.SUPABASE_DB_USER || 'postgres.gbfywcyoyhksgnxriwtk';
  const db = process.env.SUPABASE_DB_NAME || 'postgres';

  const encPass = encodeURIComponent(pass);
  return `postgresql://${user}:${encPass}@${host}:${port}/${db}?sslmode=require`;
}

/**
 * Runs pending migrations safely and idempotently.
 * Never throws an error into the application stack.
 */
export async function runDbMigrations() {
  const connectionString = getDbConnectionString();
  if (!connectionString) {
    console.log('[DB Auto-Migration] No DB connection string configured. Skipping auto-migration.');
    return { status: 'skipped', reason: 'no_credentials' };
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();

    // 1. Create migration tracker table if it does not exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        name text PRIMARY KEY,
        applied_at timestamptz DEFAULT now()
      );
    `);

    // 2. Fetch set of already applied migrations
    const { rows } = await client.query('SELECT name FROM public.schema_migrations');
    const applied = new Set(rows.map((r) => r.name));

    // 3. Find all migration SQL files
    const migrationDir = path.join(process.cwd(), 'supabase');
    if (!fs.existsSync(migrationDir)) {
      await client.end();
      return { status: 'skipped', reason: 'no_migration_directory' };
    }

    const files = fs
      .readdirSync(migrationDir)
      .filter((f) => f.startsWith('migration_') && f.endsWith('.sql'))
      .sort();

    const results = [];

    for (const file of files) {
      if (applied.has(file)) {
        results.push({ file, status: 'already_applied' });
        continue;
      }

      const filePath = path.join(migrationDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO public.schema_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING',
          [file]
        );
        await client.query('COMMIT');
        console.log(`[DB Auto-Migration] ✅ Successfully applied: ${file}`);
        results.push({ file, status: 'applied' });
      } catch (err) {
        await client.query('ROLLBACK');
        console.warn(`[DB Auto-Migration] ⚠️ Failed to apply ${file}: ${err.message}`);
        results.push({ file, status: 'failed', error: err.message });
        break; // Stop running subsequent dependent migrations
      }
    }

    await client.end();
    return { status: 'completed', results };
  } catch (err) {
    if (process.env.DEBUG_MIGRATIONS === 'true') {
      console.warn(`[DB Auto-Migration] Notice: Direct pooler connection (${err.message}). Auto-migration deferred.`);
    }
    client.end().catch(() => {});
    return { status: 'deferred', error: err.message };
  }
}
