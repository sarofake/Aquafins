import { NextResponse } from 'next/server';
import { requireAuth, requireSupabase, sanitizeSlide } from '@/lib/adminHelpers';
import { invalidateCache } from '@/lib/cache';

export async function PUT(req, { params }) {
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

    const { id } = await params;
    const { data, error } = await sb
      .from('hero_slides')
      .update(slide)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    invalidateCache('hero');
    return NextResponse.json({ slide: data });
  } catch (err) {
    console.error('Error in PUT /api/admin/hero/[id]:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const authCheck = await requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: 'Supabase admin client not configured.' },
      { status: 503 }
    );
  }

  const { id } = await params;
  const { error } = await sb.from('hero_slides').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  invalidateCache('hero');
  return NextResponse.json({ ok: true });
}
