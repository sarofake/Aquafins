import { NextResponse } from 'next/server';
import { requireAuth, requireSupabase } from '@/lib/adminHelpers';

export async function GET(req) {
  const authCheck = requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const [products, categories, slides] = await Promise.all([
    sb.from('products').select('*', { count: 'exact', head: true }),
    sb.from('categories').select('*', { count: 'exact', head: true }),
    sb.from('hero_slides').select('*', { count: 'exact', head: true }),
  ]);

  return NextResponse.json({
    products: products.count || 0,
    categories: categories.count || 0,
    slides: slides.count || 0,
  });
}
