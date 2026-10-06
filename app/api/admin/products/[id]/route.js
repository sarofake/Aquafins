import { NextResponse } from 'next/server';
import { requireAuth, requireSupabase, sanitizeProduct, ensureUniqueSlug } from '@/lib/adminHelpers';
import { invalidateCache } from '@/lib/cache';

export async function GET(req, { params }) {
  const authCheck = requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase admin client not configured.' }, { status: 503 });
  }

  const { id } = await params;
  const { data, error } = await sb
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ product: data });
}

export async function PUT(req, { params }) {
  const authCheck = requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase admin client not configured.' }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const product = await sanitizeProduct(body);
    if (product.error) return NextResponse.json({ error: product.error }, { status: 400 });

    const { id } = await params;

    // Renaming a product must never change its public URL.
    if (!body.slug || !String(body.slug).trim()) {
      const { data: existing } = await sb
        .from('products')
        .select('slug')
        .eq('id', id)
        .maybeSingle();
      if (existing?.slug) product.slug = existing.slug;
    }
    product.slug = await ensureUniqueSlug(sb, product.slug, id);

    const { data, error } = await sb
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    invalidateCache('products');
    return NextResponse.json({ product: data });
  } catch (err) {
    console.error('Error in PUT /api/admin/products/[id]:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const authCheck = requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase admin client not configured.' }, { status: 503 });
  }

  const { id } = await params;
  const { error } = await sb.from('products').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  invalidateCache('products');
  return NextResponse.json({ ok: true });
}
