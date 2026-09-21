import { NextResponse } from 'next/server';
import { requireAuth, requireSupabase, sanitizeProduct } from '@/lib/adminHelpers';
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

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 10), 200);
  const offset = (page - 1) * limit;

  const { data, error, count } = await sb
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    products: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}

export async function POST(req) {
  const authCheck = requireAuth(req);
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
    const product = await sanitizeProduct(body);
    if (product.error) return NextResponse.json({ error: product.error }, { status: 400 });

    const { data, error } = await sb
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    invalidateCache('products');
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (err) {
    console.error('Error in POST /api/admin/products:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
