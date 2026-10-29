import { NextResponse } from 'next/server';
import { requireAuth, requireSupabase } from '@/lib/adminHelpers';

export async function GET(req) {
  const authCheck = await requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const [productsRes, categoriesRes, slidesRes, allCategoriesRes, allProductsRes] = await Promise.all([
    sb.from('products').select('*', { count: 'exact', head: true }),
    sb.from('categories').select('*', { count: 'exact', head: true }),
    sb.from('hero_slides').select('*', { count: 'exact', head: true }),
    sb.from('categories').select('id, name, name_bn, slug').order('sort_order', { ascending: true }),
    sb.from('products').select('id, category, category_id, available, price, name, created_at'),
  ]);

  const rawCategories = allCategoriesRes.data || [];
  const rawProducts = allProductsRes.data || [];

  const categoryMap = {};
  rawCategories.forEach((cat) => {
    categoryMap[cat.id] = {
      id: cat.id,
      name: cat.name,
      name_bn: cat.name_bn,
      slug: cat.slug,
      count: 0,
      availableCount: 0,
      outOfStockCount: 0,
    };
  });

  let uncategorizedCount = 0;
  let availableTotal = 0;
  let outOfStockTotal = 0;

  rawProducts.forEach((prod) => {
    const isAvailable = prod.available !== false;
    if (isAvailable) availableTotal += 1;
    else outOfStockTotal += 1;

    let matchedCat = null;
    if (prod.category_id && categoryMap[prod.category_id]) {
      matchedCat = categoryMap[prod.category_id];
    } else if (prod.category) {
      const rawCat = String(prod.category).trim().toLowerCase();
      matchedCat = Object.values(categoryMap).find(
        (c) => c.name?.toLowerCase() === rawCat || c.slug?.toLowerCase() === rawCat
      );
    }

    if (matchedCat) {
      matchedCat.count += 1;
      if (isAvailable) matchedCat.availableCount += 1;
      else matchedCat.outOfStockCount += 1;
    } else {
      uncategorizedCount += 1;
    }
  });

  const totalProds = productsRes.count || rawProducts.length || 0;

  const categoriesWithProducts = Object.values(categoryMap).map((cat) => ({
    ...cat,
    percentage: totalProds > 0 ? Math.round((cat.count / totalProds) * 100) : 0,
  }));

  if (uncategorizedCount > 0) {
    categoriesWithProducts.push({
      id: 'uncategorized',
      name: 'Uncategorized',
      name_bn: 'অন্যান্য',
      slug: 'uncategorized',
      count: uncategorizedCount,
      availableCount: uncategorizedCount,
      outOfStockCount: 0,
      percentage: totalProds > 0 ? Math.round((uncategorizedCount / totalProds) * 100) : 0,
    });
  }

  return NextResponse.json({
    products: totalProds,
    categories: categoriesRes.count || rawCategories.length || 0,
    slides: slidesRes.count || 0,
    availableProducts: availableTotal,
    outOfStockProducts: outOfStockTotal,
    categoryBreakdown: categoriesWithProducts,
  });
}

