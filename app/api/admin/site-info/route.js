import { NextResponse } from 'next/server';
import { requireAuth, requireSupabase } from '@/lib/adminHelpers';
import { invalidateCache } from '@/lib/cache';

export async function GET(req) {
  const authCheck = requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { data, error } = await sb
    .from('site_info')
    .select('key, value');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const info = {};
  (data || []).forEach((row) => { info[row.key] = row.value; });
  return NextResponse.json({ info });
}

export async function POST(req) {
  const authCheck = requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const entries = Object.entries(body);
    if (entries.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const rows = entries.map(([key, value]) => ({
      key,
      value: String(value ?? ''),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await sb
      .from('site_info')
      .upsert(rows, { onConflict: 'key' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    invalidateCache('site_info');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error in POST /api/admin/site-info:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
