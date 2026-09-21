/**
 * Auto-translation utility for converting English text to Bangla
 * Uses a built-in dictionary for common aquatic terms and MyMemory free translation API for dynamic content.
 */

const COMMON_TERMS = {
  // Animals & Fish
  'red cherry shrimp': 'রেড চেরি শ্রিম্প',
  'betta fish': 'বেটা মাছ',
  'guppy': 'গাপ্পি মাছ',
  'tetra': 'টেট্রা মাছ',
  'neon tetra': 'নিয়ন টেট্রা',
  'cardinal tetra': 'কার্ডিনাল টেট্রা',
  'corydoras': 'করিডোরাস',
  'angelfish': 'এঞ্জেল ফিশ',
  'discus': 'ডিসকাস ফিশ',
  'snail': 'শামুক',
  'mystery snail': 'মিস্ট্রি স্নেল',

  // Plants & Scaping
  'anubias': 'অনুবিয়াস',
  'java moss': 'জাভা মস',
  'amazon sword': 'অ্যামাজন সোর্ড',
  'driftwood': 'ড্রিফ্টউড',
  'aquarium rock': 'অ্যাকোয়ারিয়াম পাথর',
  'substrate': 'সাবস্ট্রেট',
  'soil': 'সয়েল',

  // Supplies & Common Terms
  'aquarium filter': 'অ্যাকোয়ারিয়াম ফিল্টার',
  'wrgb light': 'ডব্লিউআরজিবি লাইট',
  'fish food': 'মাছের খাবার',
  'special offer': 'বিশেষ অফার',
  'new arrival': 'নতুন কালেকশন',
  'explore catalog': 'ক্যাটালগ দেখুন',
  'shop catalog': 'ক্যাটালগ দেখুন',
  'shop now': 'অর্ডার করুন',
  'order now': 'অর্ডার করুন',
  'in stock': 'স্টকে আছে',
  'out of stock': 'স্টকে নেই',
};

export async function translateToBangla(text) {
  if (!text || typeof text !== 'string' || !text.trim()) return '';

  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. Check local dictionary
  if (COMMON_TERMS[lower]) {
    return COMMON_TERMS[lower];
  }

  // 2. Fetch from MyMemory Translation API with safe AbortController
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 3000) : null;

    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=en|bn`,
      controller ? { signal: controller.signal } : {}
    );

    if (timeoutId) clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json();
      if (
        data &&
        data.responseData &&
        data.responseData.translatedText &&
        data.responseData.translatedText !== clean &&
        !data.responseData.translatedText.includes('MYMEMORY WARNING')
      ) {
        return data.responseData.translatedText;
      }
    }
  } catch (err) {
    // Silent fallback if API times out or fails
  }

  // Fallback: return original text
  return clean;
}
