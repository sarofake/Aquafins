import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/adminHelpers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { v2 as cloudinary } from 'cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REQUIRED_TABLES = ['categories', 'products', 'site_info', 'hero_slides', 'contact_messages'];

function configureCloudinary() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return { configured: false, missing: [
      !cloudName && 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
      !apiKey && 'CLOUDINARY_API_KEY',
      !apiSecret && 'CLOUDINARY_API_SECRET',
    ].filter(Boolean) };
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  return { configured: true, cloudName };
}

async function checkDatabase() {
  if (!supabaseAdmin) {
    return { ok: false, error: 'Supabase URL or service role key is not configured.' };
  }

  const startedAt = Date.now();

  const results = await Promise.all(
    REQUIRED_TABLES.map(async (table) => {
      try {
        const { error } = await supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
        return error ? { table, error: error.message } : null;
      } catch (err) {
        return { table, error: err?.message || 'Query failed' };
      }
    })
  );

  const missing = results.filter(Boolean);

  return {
    ok: missing.length === 0,
    latencyMs: Date.now() - startedAt,
    tablesChecked: REQUIRED_TABLES.length,
    missing,
    error: missing.length
      ? `Missing or unreachable: ${missing.map((item) => item.table).join(', ')}`
      : null,
  };
}

async function checkCloudinary() {
  const config = configureCloudinary();

  if (!config.configured) {
    return {
      ok: false,
      configured: false,
      error: `Missing credentials: ${config.missing.join(', ')}`,
    };
  }

  const startedAt = Date.now();
  let timer;

  try {
    // Admin API ping — proves the key/secret pair actually works.
    const response = await Promise.race([
      cloudinary.api.ping(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Timed out after 8s')), 8000);
      }),
    ]);

    return {
      ok: response?.status === 'ok',
      configured: true,
      cloudName: config.cloudName,
      latencyMs: Date.now() - startedAt,
      error: response?.status === 'ok' ? null : 'Unexpected response from Cloudinary',
    };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      cloudName: config.cloudName,
      error: err?.message || 'Cloudinary request failed',
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function GET(req) {
  const authCheck = requireAuth(req);
  if (authCheck) return authCheck;

  const [database, cloudinaryStatus] = await Promise.all([checkDatabase(), checkCloudinary()]);

  return NextResponse.json(
    {
      database,
      cloudinary: cloudinaryStatus,
      checkedAt: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}
