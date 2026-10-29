import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { supabase } from '@/lib/supabase';
import { authed } from '@/lib/adminHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STARTED_AT = Date.now();

// Tables the app cannot run without.
const REQUIRED_TABLES = ['categories', 'products', 'site_info', 'hero_slides', 'contact_messages'];

const SITE_FIELDS = {
  site_name: 'name',
  site_tagline: 'tagline',
  logo_url: 'logoUrl',
  favicon_url: 'faviconUrl',
};

async function checkTables(client) {
  const entries = await Promise.all(
    REQUIRED_TABLES.map(async (table) => {
      try {
        const { error } = await client.from(table).select('*', { count: 'exact', head: true });
        return [table, !error];
      } catch {
        return [table, false];
      }
    })
  );
  return Object.fromEntries(entries);
}

async function readSiteInfo(client) {
  const { data, error } = await client.from('site_info').select('key, value');
  if (error) return { error: error.message };

  const values = Object.fromEntries((data || []).map((row) => [row.key, row.value]));
  const site = {};
  for (const [column, key] of Object.entries(SITE_FIELDS)) {
    site[key] = values[column] || null;
  }
  return site;
}

export async function GET(req) {
  const client = supabaseAdmin || supabase;

  // Anonymous callers get a minimal boolean — no DB latency, config hints,
  // table names or deployment metadata. The full payload stays admin-only.
  if (!(await authed(req))) {
    let ok = false;
    try {
      const siteResult = await readSiteInfo(client);
      const tables = client ? await checkTables(client) : {};
      const missingTables = REQUIRED_TABLES.filter((table) => !tables[table]);
      ok = !siteResult.error && missingTables.length === 0;
    } catch {
      ok = false;
    }
    return NextResponse.json(
      { ok },
      { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }

  const database = { ok: false, latencyMs: null };
  let tables = {};
  let site = {};

  if (!client) {
    database.error = 'Supabase is not configured';
  } else {
    const startedAt = Date.now();
    const siteResult = await readSiteInfo(client);
    database.latencyMs = Date.now() - startedAt;

    if (siteResult.error) {
      database.error = siteResult.error;
    } else {
      database.ok = true;
      site = siteResult;
    }

    tables = await checkTables(client);
  }

  const missingTables = REQUIRED_TABLES.filter((table) => !tables[table]);
  const healthy = database.ok && missingTables.length === 0;

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'error',
      database,
      tables: {
        ok: missingTables.length === 0,
        missing: missingTables,
      },
      site,
      hint:
        missingTables.length > 0
          ? 'Tables are missing. Redeploy (prebuild runs migrations) or POST /api/admin/migrate while signed in. If it persists, verify SUPABASE_DB_SESSION_URL / SUPABASE_DB_PASSWORD are correct.'
          : undefined,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round((Date.now() - STARTED_AT) / 1000),
      deploy: {
        commit: process.env.COMMIT_REF || null,
        branch: process.env.BRANCH || null,
      },
    },
    {
      status: healthy ? 200 : 503,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    }
  );
}
