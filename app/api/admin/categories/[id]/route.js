import { NextResponse } from 'next/server';
import { requireAuth, requireSupabase } from '@/lib/adminHelpers';
import { translateToBangla } from '@/lib/translator';
import { invalidateCache } from '@/lib/cache';

export async function PUT(req, { params }) {
  const authCheck = requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase admin client not configured.' }, { status: 500 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { name, name_bn, slug, icon, description, description_bn, parent_id, sort_order, image, image_public_id } = body;

    const catName = typeof name === 'string' ? name.trim() : '';
    const final_name_bn =
      typeof name_bn === 'string' && name_bn.trim()
        ? name_bn.trim()
        : catName
        ? await translateToBangla(catName)
        : null;

    const catDesc = typeof description === 'string' ? description.trim() : '';
    const final_description_bn =
      typeof description_bn === 'string' && description_bn.trim()
        ? description_bn.trim()
        : catDesc
        ? await translateToBangla(catDesc)
        : '';

    const { data, error } = await sb
      .from('categories')
      .update({
        name: catName,
        name_bn: final_name_bn,
        slug: slug?.toLowerCase().trim().replace(/\s+/g, '-'),
        icon: icon || 'Grid',
        description: catDesc,
        description_bn: final_description_bn,
        parent_id: parent_id ? Number(parent_id) : null,
        sort_order: Number(sort_order) || 0,
        image: typeof image === 'string' ? image : '',
        image_public_id: typeof image_public_id === 'string' ? image_public_id : '',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateCache('categories');
    return NextResponse.json({ category: data });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const authCheck = requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase admin client not configured.' }, { status: 500 });
  }

  const { id } = await params;
  const { error } = await sb.from('categories').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  invalidateCache('categories');
  return NextResponse.json({ ok: true });
}
