import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAuth, requireSupabase } from '@/lib/adminHelpers';
import { invalidateCache } from '@/lib/cache';

const DEFAULT_SITE_INFO = {
  site_name: 'Aqua Fins Bangladesh',
  site_tagline: 'Premium Aquatics & Supplies',
  announcement_enabled: 'true',
  announcement_badge: 'SPECIAL OFFER',
  announcement_badge_bn: 'বিশেষ অফার',
  announcement_text: '🎉 Welcome to Aqua Fins Bangladesh! Free delivery on all Plant & Shrimp Combo orders over ৳1500 this week! | Discover our premium aquatic plants, exotic fish & accessories.',
  announcement_text_bn: '🎉 অ্যাকুয়া ফিন্স বাংলাদেশে স্বাগতম! এই সপ্তাহে ১৫০০ টাকার বেশি কম্বো অর্ডারে ফ্রি ডেলিভারি! | আমাদের এক্সক্লুসিভ লাইভস্টক ও প্ল্যান্ট কালেকশন দেখুন।',
  announcement_link: '/products?category=combo',
};

export async function GET(req) {
  const authCheck = await requireAuth(req);
  if (authCheck) return authCheck;

  const sb = requireSupabase();
  if (!sb) {
    return NextResponse.json({ info: DEFAULT_SITE_INFO });
  }

  const { data } = await sb
    .from('site_info')
    .select('key, value');

  const info = { ...DEFAULT_SITE_INFO };
  (data || []).forEach((row) => { info[row.key] = row.value; });
  return NextResponse.json({ info });
}

export async function POST(req) {
  const authCheck = await requireAuth(req);
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

    // Name, tagline, description and favicon are baked into every page's static
    // HTML and <head>, so a saved edit must purge the rendered pages. Without
    // this the operator keeps seeing the old tagline until ISR expires.
    revalidatePath('/', 'layout');

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error in POST /api/admin/site-info:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
