import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth, requireSupabase } from '@/lib/adminHelpers';
import { translateToBangla } from '@/lib/translator';
import { invalidateCache } from '@/lib/cache';

export async function GET(req) {
  const authCheck = requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: 'Supabase admin client not configured.' },
      { status: 503 }
    );
  }

  const { data, error } = await sb
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ categories: data || [] });
}

export async function POST(req) {
  const authCheck = requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json(
      { error: 'Supabase admin client not configured.' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { name, name_bn, slug, icon, description, description_bn, parent_id, sort_order, image, image_public_id } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Category Name (English) and slug are required' }, { status: 400 });
    }

    const catName = name.trim();
    const final_name_bn =
      typeof name_bn === 'string' && name_bn.trim()
        ? name_bn.trim()
        : await translateToBangla(catName);

    const catDesc = typeof description === 'string' ? description.trim() : '';
    const final_description_bn =
      typeof description_bn === 'string' && description_bn.trim()
        ? description_bn.trim()
        : catDesc
        ? await translateToBangla(catDesc)
        : '';

    const { data, error } = await sb
      .from('categories')
      .insert({
        name: catName,
        name_bn: final_name_bn,
        slug: slug.toLowerCase().trim().replace(/\s+/g, '-'),
        icon: icon || 'Grid',
        description: catDesc,
        description_bn: final_description_bn,
        parent_id: parent_id ? Number(parent_id) : null,
        sort_order: Number(sort_order) || 0,
        image: typeof image === 'string' ? image : '',
        image_public_id: typeof image_public_id === 'string' ? image_public_id : '',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateCache('categories');

    // The header, footer, home grid and catalog chips are rendered on the
    // server, so a new category must purge those pages instead of waiting for
    // the 60s ISR window.
    revalidatePath('/', 'layout');

    return NextResponse.json({ category: data });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
