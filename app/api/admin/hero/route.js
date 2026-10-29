import { NextResponse } from 'next/server';
import { requireAuth, requireSupabase, sanitizeSlide } from '@/lib/adminHelpers';
import { invalidateCache } from '@/lib/cache';

export async function GET(req) {
  const authCheck = await requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: 'Supabase admin client not configured.' },
      { status: 503 }
    );
  }

  const { data, error } = await sb
    .from('hero_slides')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ slides: data || [] });
}

export async function POST(req) {
  const authCheck = await requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: 'Supabase admin client not configured.' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const slide = await sanitizeSlide(body);
    if (slide.error) return NextResponse.json({ error: slide.error }, { status: 400 });

    const { data, error } = await sb
      .from('hero_slides')
      .insert(slide)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    invalidateCache('hero');
    return NextResponse.json({ slide: data }, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/admin/hero:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
