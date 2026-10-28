import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

/**
 * Runs the SQL files in `supabase/` against the database so a fresh Supabase
 * project gets its schema automatically.
 *
 * `migration_000_baseline.sql` holds the complete, idempotent schema and must
 * always run first. The numbered files after it are incremental changes kept
 * for databases created before the baseline existed.
 */

// Only numbered migrations are executed. Anything else in the folder (e.g. a
// scratch file) is ignored instead of being half-applied.
const MIGRATION_FILE_RE = /^migration_\d+.*\.sql$/;

// Arbitrary constant so concurrent cold starts serialise instead of racing
// through CREATE TABLE / CREATE POLICY / seed inserts at the same time.
const MIGRATION_LOCK_ID = 7018273645;

const CONNECT_TIMEOUT_MS = 10000;

export const DB_ENV_HINT =
  'Set SUPABASE_DB_SESSION_URL (preferred) or SUPABASE_DB_PASSWORD ' +
  '(+ SUPABASE_DB_HOST / SUPABASE_DB_USER / SUPABASE_DB_NAME) in the site environment.';

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
 * Locates the migration folder. Build-time runs use the repo root; bundled
 * serverless functions may run from a nested working directory.
 */
export function findMigrationDirectory() {
  const candidates = [
    path.join(process.cwd(), 'supabase'),
    path.join(process.cwd(), '..', 'supabase'),
    path.join(process.cwd(), '..', '..', 'supabase'),
  ];

  for (const dir of candidates) {
    try {
      if (fs.statSync(dir).isDirectory()) return dir;
    } catch {
      // Not there, try the next one
    }
  }
  return null;
}

export function listMigrationFiles(directory) {
  return fs
    .readdirSync(directory)
    .filter((file) => MIGRATION_FILE_RE.test(file))
    .sort();
}

/**
 * Applies every pending migration. Never throws: returns a status object so
 * callers (build step, instrumentation, admin API, health check) can report it.
 */
export async function runDbMigrations() {
  const connectionString = getDbConnectionString();
  if (!connectionString) {
    return {
      status: 'skipped',
      reason: 'no_credentials',
      message: `No database credentials configured. ${DB_ENV_HINT}`,
    };
  }

  const directory = findMigrationDirectory();
  if (!directory) {
    return {
      status: 'skipped',
      reason: 'no_migration_directory',
      message: 'Could not find the supabase/ migration folder in the deployed bundle.',
    };
  }

  const files = listMigrationFiles(directory);
  if (files.length === 0) {
    return {
      status: 'skipped',
      reason: 'no_migration_files',
      directory,
      message: 'The supabase/ folder contains no migration_*.sql files.',
    };
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
  });

  let locked = false;

  try {
    await client.connect();
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_ID]);
    locked = true;

    // 1. Migration tracker
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        name text PRIMARY KEY,
        applied_at timestamptz DEFAULT now()
      );
    `);

    // 2. Already applied
    const { rows } = await client.query('SELECT name FROM public.schema_migrations');
    const applied = new Set(rows.map((row) => row.name));

    const results = [];

    // 3. Apply pending files in order
    for (const file of files) {
      if (applied.has(file)) {
        results.push({ file, status: 'already_applied' });
        continue;
      }

      const sql = fs.readFileSync(path.join(directory, file), 'utf8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO public.schema_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING',
          [file]
        );
        await client.query('COMMIT');
        console.log(`[DB Auto-Migration] ✅ Applied ${file}`);
        results.push({ file, status: 'applied' });
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.warn(`[DB Auto-Migration] ❌ Failed ${file}: ${err.message}`);
        results.push({ file, status: 'failed', error: err.message });
        break; // Later files may depend on this one
      }
    }

    const failed = results.filter((result) => result.status === 'failed');

    return {
      status: failed.length === 0 ? 'completed' : 'failed',
      directory,
      appliedCount: results.filter((result) => result.status === 'applied').length,
      pendingCount: results.filter((result) => result.status === 'already_applied').length,
      results,
    };
  } catch (err) {
    console.warn(`[DB Auto-Migration] ❌ Connection failed: ${err.message}`);
    return { status: 'failed', reason: 'connection_failed', error: err.message };
  } finally {
    if (locked) {
      await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]).catch(() => {});
    }
    await client.end().catch(() => {});
  }
}
