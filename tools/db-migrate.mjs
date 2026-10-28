#!/usr/bin/env node
/**
 * Build-time / manual database bootstrap.
 *
 *   npm run db:migrate
 *
 * Runs before `next build` (see package.json) so a fresh Supabase project has
 * every table before the deploy goes live. Never fails the build: missing
 * credentials or an unreachable database only produce a warning, and the same
 * logic still runs at server start via instrumentation.js.
 *
 * Set MIGRATIONS_STRICT=true to make migration failures fail the build.
 */

import fs from 'fs';
import { runDbMigrations, getDbConnectionString, DB_ENV_HINT } from '../lib/dbMigrations.mjs';

function loadLocalEnv() {
  for (const file of ['.env.local', '.env']) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) continue;
      let value = rawValue.trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const strict = process.env.MIGRATIONS_STRICT === 'true';

if (!getDbConnectionString()) {
  console.warn(`[db:migrate] Skipped — no database credentials. ${DB_ENV_HINT}`);
  process.exit(0);
}

const result = await runDbMigrations();

if (result.status === 'completed') {
  console.log(
    `[db:migrate] Schema up to date (${result.appliedCount} applied, ${result.pendingCount} already present) in ${result.directory}`
  );
} else {
  console.warn(`[db:migrate] ${result.status.toUpperCase()}:`, result.message || result.error || '');
  if (Array.isArray(result.results)) {
    for (const item of result.results) {
      if (item.status === 'failed') {
        console.warn(`[db:migrate]   ${item.file}: ${item.error}`);
      }
    }
  }
}

const failed = result.status === 'failed';

if (failed && strict) {
  console.error('[db:migrate] MIGRATIONS_STRICT=true — failing the build.');
  process.exit(1);
}

if (failed) {
  console.warn('[db:migrate] Continuing anyway. Check /api/health for table status once deployed.');
}

process.exit(0);
