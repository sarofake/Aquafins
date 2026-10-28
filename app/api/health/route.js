import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STARTED_AT = Date.now();

// Presence-only checks. Values are never returned.
const TRACKED_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'AQUAFINS_ADMIN_ID',
  'AQUAFINS_ADMIN_PASSWORD',
  'AQUAFINS_SESSION_SECRET',
];

async function checkDatabase() {
  const client = supabaseAdmin || supabase;
  if (!client) {
    return { status: 'skipped', message: 'Supabase URL / key not configured' };
  }

  const startedAt = Date.now();
  try {
    const { error } = await client
      .from('site_info')
      .select('key', { count: 'exact', head: true });

    if (error) {
      return { status: 'error', message: error.message, latencyMs: Date.now() - startedAt };
    }
    return { status: 'ok', latencyMs: Date.now() - startedAt };
  } catch (err) {
    return {
      status: 'error',
      message: err?.message || 'Database check failed',
      latencyMs: Date.now() - startedAt,
    };
  }
}

export async function GET() {
  const database = await checkDatabase();
  const healthy = database.status === 'ok';

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round((Date.now() - STARTED_AT) / 1000),
      deploy: {
        commit: process.env.COMMIT_REF || null,
        branch: process.env.BRANCH || null,
        context: process.env.CONTEXT || null,
        node: process.version,
      },
      checks: { database },
      env: Object.fromEntries(TRACKED_ENV.map((key) => [key, Boolean(process.env[key])])),
    },
    {
      status: healthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
