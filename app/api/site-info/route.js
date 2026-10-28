import { supabase } from '@/lib/supabase';
import { cachedResponse } from '@/lib/cache';

const DEFAULT_SITE_INFO = {
  site_name: 'Aqua Fins Bangladesh',
  site_tagline: 'Premium Aquatics & Supplies',
  announcement_enabled: 'true',
  announcement_badge: 'SPECIAL OFFER',
  announcement_badge_bn: 'বিশেষ অফার',
  announcement_text: '🎉 Welcome to Aqua Fins Bangladesh! Free delivery on all Plant & Shrimp Combo orders over ৳1500 this week! | Explore our premium aquatic plants, exotic fish & accessories.',
  announcement_text_bn: '🎉 অ্যাকুয়া ফিন্স বাংলাদেশে স্বাগতম! এই সপ্তাহে ১৫০০ টাকার বেশি কম্বো অর্ডারে ফ্রি ডেলিভারি! | আমাদের এক্সক্লুসিভ লাইভস্টক ও প্ল্যান্ট কালেকশন দেখুন।',
  announcement_link: '/products?category=combo',
};

export async function GET() {
  // Short TTL: branding edits must show up quickly for the operator.
  return cachedResponse('site_info:public', 60, 120, async () => {
    if (!supabase) return { info: DEFAULT_SITE_INFO };

    try {
      const { data, error } = await supabase
        .from('site_info')
        .select('key, value');

      if (error || !data || data.length === 0) {
        return { info: DEFAULT_SITE_INFO };
      }

      const info = { ...DEFAULT_SITE_INFO };
      data.forEach((row) => { info[row.key] = row.value; });
      return { info };
    } catch {
      return { info: DEFAULT_SITE_INFO };
    }
  });
}
