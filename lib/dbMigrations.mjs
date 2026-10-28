import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

/**
 * Runs the SQL files in `supabase/` against the database so a fresh Supabase
 * project gets its schema automatically.
 *
 * Rule: nothing is executed when the schema is already there.
 *   - Existing database without migration history  -> recorded as applied only.
 *   - Baseline pending but tables/columns are fine  -> recorded without running.
 *   - Empty or incomplete schema                    -> baseline creates what is missing.
 *
 * `migration_000_baseline.sql` holds the complete, idempotent schema and always
 * runs first. The numbered files after it are incremental changes kept for
 * databases created before the baseline existed.
 */

const BASELINE_FILE = 'migration_000_baseline.sql';

// Files that shipped before the baseline existed. The baseline already creates
// everything they do, so they are recorded as applied instead of replayed
// (replaying them can conflict: e.g. 007 re-creates an existing policy).
const LEGACY_MIGRATION_RE = /^migration_00[1-8]_.*\.sql$/;

// Only numbered migrations are executed. Anything else in the folder (e.g. a
// scratch file) is ignored instead of being half-applied.
const MIGRATION_FILE_RE = /^migration_\d+.*\.sql$/;

// Tables/columns the app queries. Used to decide whether anything needs doing.
const REQUIRED_SCHEMA = {
  categories: ['name_bn', 'description_bn', 'parent_id', 'image', 'image_public_id', 'updated_at'],
  products: [
    'name_bn',
    'slug',
    'category_id',
    'original_price',
    'description_bn',
    'images',
    'keywords',
    'quantity',
    'quantity_bn',
    'deals',
    'updated_at',
  ],
  site_info: ['updated_at'],
  hero_slides: [],
  contact_messages: ['updated_at'],
};

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

  // No project-specific defaults: each deployment points at its own Supabase
  // project, so host/user must come from that project's settings.
  const host = process.env.SUPABASE_DB_HOST;
  const user = process.env.SUPABASE_DB_USER;
  if (!host || !user) return null;

  const port = process.env.SUPABASE_DB_PORT || '5432';
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
 * Reports which required tables/columns are absent, without changing anything.
 */
async function getSchemaStatus(client) {
  const tables = Object.keys(REQUIRED_SCHEMA);
  const { rows } = await client.query(
    `SELECT table_name, column_name
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ANY($1)`,
    [tables]
  );

  const columnsByTable = {};
  for (const row of rows) {
    if (!columnsByTable[row.table_name]) columnsByTable[row.table_name] = new Set();
    columnsByTable[row.table_name].add(row.column_name);
  }

  const missingTables = tables.filter((table) => !columnsByTable[table]);
  const missingColumns = [];

  for (const [table, requiredColumns] of Object.entries(REQUIRED_SCHEMA)) {
    if (!columnsByTable[table]) continue;
    for (const column of requiredColumns) {
      if (!columnsByTable[table].has(column)) missingColumns.push(`${table}.${column}`);
    }
  }

  return { missingTables, missingColumns };
}

/**
 * Applies pending migrations. Never throws: returns a status object so
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

    // 3. What the database already has (read-only)
    const schemaBefore = await getSchemaStatus(client);
    const schemaComplete =
      schemaBefore.missingTables.length === 0 && schemaBefore.missingColumns.length === 0;

    const results = [];

    const recordAsApplied = async (file) => {
      await client.query(
        'INSERT INTO public.schema_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING',
        [file]
      );
      applied.add(file);
    };

    const runFile = async (file) => {
      try {
        // The SQL files carry their own BEGIN/COMMIT. Strip those lines so the
        // whole file plus the bookkeeping insert is one atomic transaction.
        const sql = fs
          .readFileSync(path.join(directory, file), 'utf8')
          .replace(/^\s*(begin|commit)\s*;\s*$/gim, '');

        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO public.schema_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING',
          [file]
        );
        await client.query('COMMIT');
        console.log(`[DB Auto-Migration] ✅ Applied ${file}`);
        return { file, status: 'applied' };
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.warn(`[DB Auto-Migration] ❌ Failed ${file}: ${err.message}`);
        return { file, status: 'failed', error: err.message };
      }
    };

    // 3a. Database provisioned outside this runner (SQL editor, another app):
    //     adopt the baseline and legacy files without executing anything.
    if (applied.size === 0 && schemaComplete) {
      for (const file of files) {
        if (file !== BASELINE_FILE && !LEGACY_MIGRATION_RE.test(file)) continue;
        await recordAsApplied(file);
        results.push({ file, status: 'skipped_schema_present' });
      }
      console.log(
        '[DB Auto-Migration] ℹ️ Tables already exist — schema recorded as applied, nothing executed.'
      );
    }

    // 3b. Schema complete but baseline not recorded (history gap): record the
    //     baseline and the legacy files it supersedes, execute nothing.
    if (schemaComplete && !applied.has(BASELINE_FILE)) {
      await recordAsApplied(BASELINE_FILE);
      results.push({ file: BASELINE_FILE, status: 'skipped_schema_present' });

      for (const file of files) {
        if (applied.has(file) || !LEGACY_MIGRATION_RE.test(file)) continue;
        await recordAsApplied(file);
        results.push({ file, status: 'superseded_by_baseline' });
      }

      console.log('[DB Auto-Migration] ℹ️ Schema already complete — nothing was created.');
    }

    // 3c. Apply the baseline first. When it succeeds, every legacy file after
    //     it is redundant, so they get recorded instead of executed.
    if (!applied.has(BASELINE_FILE)) {
      const baselineResult = await runFile(BASELINE_FILE);
      results.push(baselineResult);

      if (baselineResult.status === 'applied') {
        for (const file of files) {
          if (file === BASELINE_FILE || applied.has(file)) continue;
          if (!LEGACY_MIGRATION_RE.test(file)) continue;
          await recordAsApplied(file);
          results.push({ file, status: 'superseded_by_baseline' });
        }
      }
    }

    // 4. Apply whatever is still pending (future migrations land here)
    for (const file of files) {
      if (applied.has(file)) {
        if (!results.some((result) => result.file === file)) {
          results.push({ file, status: 'already_applied' });
        }
        continue;
      }

      const outcome = await runFile(file);
      results.push(outcome);
      if (outcome.status === 'failed') break; // Later files may depend on this one
    }

    const failed = results.filter((result) => result.status === 'failed');
    const schemaAfter = await getSchemaStatus(client).catch(() => schemaBefore);

    return {
      status: failed.length === 0 ? 'completed' : 'failed',
      directory,
      appliedCount: results.filter((result) => result.status === 'applied').length,
      skippedCount: results.filter(
        (result) => result.status === 'skipped_schema_present'
      ).length,
      schemaBefore,
      schemaAfter,
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
