'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const translations = {
  en: {
    // Header
    home: 'Home',
    about: 'About Us',
    products: 'Products Catalog',
    allProducts: 'All Products',
    plants: 'Plants',
    fish: 'Fish',
    livestock: 'Livestock',
    foodAccessories: 'Food & Accessories',
    scaping: 'Scaping',
    dealsAndOffers: 'Deals & Offers',
    archive: 'Archive',
    hotline: 'Hotline',
    dhakaBangladesh: 'Dhaka, Bangladesh',
    searchPlaceholder: 'Search plants, fish, livestock, food, accessories...',
    searchCompact: 'Search...',
    motherCategories: 'Mother Categories',
    dealsBannerTitle: 'Special Deals & Offers',
    dealsBannerSubtitle: 'Handpicked discounted offers and special deals on premium aquatic supplies.',
    noDealsFound: 'No products currently marked for special deals. Check back soon!',
    archiveComingSoonTitle: 'Coming Soon',
    archiveComingSoonSubtitle: 'Our archive section is under construction. Stay tuned for updates!',

    // Hero
    heroBadgeDefault: 'Welcome to Aqua Fins Bangladesh',
    heroTitleDefault: 'Your Premium Aquatic Partner',
    heroSubtitleDefault: 'Discover our hand-picked collection of state-of-the-art aquariums, exotic livestock, aquatic plants, and premium supplies across Bangladesh.',
    shopCatalog: 'Shop Catalog',
    exploreCategories: 'Explore Categories',

    // Categories Component
    popularCategories: 'Popular Categories',
    everythingYouNeed: 'Everything you need to build and maintain your dream aquarium.',
    viewAll: 'View All',
    exploreCollection: 'Explore collection',

    // Featured Component
    handpickedSelections: 'Handpicked Selections',
    featuredProducts: 'Featured Products',
    exploreAllProducts: 'Explore All Products',
    orderNow: 'Order Now',

    // Products Page
    aquaticProductsBannerTitle: 'Aquatic Products & Supplies',
    aquaticProductsBannerSubtitle: 'Explore high-quality plants, exotic fish, livestock, food & accessories, and professional aquascaping materials across Bangladesh.',
    loadingProducts: 'Loading products...',
    noProductsFound: 'No matching products found.',
    productDetails: 'Product Details',
    category: 'Category',
    discountOff: 'OFF',
    noImage: 'No image available',
    noDescription: 'No product details available yet.',
    quantity: 'Quantity',
    availability: 'Availability',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    stock: 'Stock',
    keywords: 'Keywords',

    // Order Modal
    orderProduct: 'Order Product',
    sendOrderRequest: 'Send Order Request',
    chooseWhereToSend: 'Choose where you want to send your order:',
    sendInWhatsapp: 'Send in WhatsApp (01787-283804)',
    sendInMessenger: 'Send in Messenger',
    visitFacebookPage: 'Visit Facebook Page',
    callHotline: 'Call Hotline: 01787-283804',

    // Footer
    brandFooterDesc: 'Your trusted partner for high-grade aquascaping products, exotic fish, healthy aquatic flora, and professional equipment nationwide.',
    quickNavigation: 'Quick Navigation',
    customerSupport: 'Customer Support',
    qualityGuaranteed: '100% Quality Guaranteed',
    allRightsReserved: 'Aqua Fins Bangladesh. All rights reserved.',
    createdBy: 'Created by',

    // About Page
    aboutTitle: 'About Aqua Fins Bangladesh',
    aboutSubtitle: 'Your trusted partner for high-grade aquascaping products, exotic fish, healthy aquatic flora, and professional equipment nationwide.',
    whoWeAre: 'Who We Are',
    passionateTitle: 'Passionate About the Aquatic World',
    passionateDesc1: 'Aqua Fins Bangladesh was founded with a single mission: to bring premium, healthy aquatic life and professional aquarium equipment to hobbyists and aquascapers across Bangladesh. From exotic fish and lush live plants to filters, lighting, and nutrition, we curate every product to meet high standards.',
    passionateDesc2: 'Whether you are setting up your first aquarium or perfecting a show-grade planted tank, our team is here to guide you with honest advice and dependable delivery nationwide.',
    browseProducts: 'Browse Products',
    exoticFishTitle: 'Exotic Fish & Livestock',
    exoticFishDesc: 'Premium bettas, tetras, shrimp, and more - healthy and acclimated.',
    livePlantsTitle: 'Live Aquatic Plants',
    livePlantsDesc: 'CO2-ready flora, moss, and aquascaping-grade plants.',
    equipmentTitle: 'Equipment & Supplies',
    equipmentDesc: 'Filters, WRGB lighting, nutrition, and professional gear.',
    nationwideTitle: 'Nationwide Delivery',
    nationwideDesc: 'Careful packaging and express delivery all over Bangladesh.',
    getInTouch: 'Get In Touch',
  },
  bn: {
    // Header
    home: 'হোম',
    about: 'আমাদের সম্পর্কে',
    products: 'পণ্য ক্যাটালগ',
    allProducts: 'সকল পণ্য',
    plants: 'প্ল্যান্টস',
    fish: 'মাছ',
    livestock: 'লাইভস্টক',
    foodAccessories: 'খাবার ও এক্সেসরিজ',
    scaping: 'একুয়াস্কেপিং',
    dealsAndOffers: 'অফার ও ডিল',
    archive: 'আর্কাইভ',
    hotline: 'হটলাইন',
    dhakaBangladesh: 'ঢাকা, বাংলাদেশ',
    searchPlaceholder: 'মাছ, প্ল্যান্টস, খাবার ও এক্সেসরিজ খুঁজুন...',
    searchCompact: 'খুঁজুন...',
    motherCategories: 'মূল ক্যাটাগরি',
    dealsBannerTitle: 'বিশেষ অফার ও ডিসকাউন্ট ডিল',
    dealsBannerSubtitle: 'আমাদের আকর্ষণীয় স্পেশাল অফার এবং স্পেশাল ডিসকাউন্টের পণ্যসমূহ সংগ্রহ করুন।',
    noDealsFound: 'বর্তমানে বিশেষ অফারের কোনো পণ্য নেই। শিগগিরই আবার চেক করুন!',
    archiveComingSoonTitle: 'শীঘ্রই আসছে',
    archiveComingSoonSubtitle: 'আমাদের আর্কাইভ সেকশন নির্মাণাধীন। আপডেটের জন্য অপেক্ষা করুন!',

    // Hero
    heroBadgeDefault: 'অ্যাকুয়া ফিন্স বাংলাদেশে স্বাগতম',
    heroTitleDefault: 'আপনার বিশ্বস্ত অ্যাকোয়ারিয়াম পার্টনার',
    heroSubtitleDefault: 'উন্নত মানের অ্যাকোয়ারিয়াম, প্রিমিয়াম মাছ, একুয়াটিক প্ল্যান্টস এবং সেরা অ্যাকোয়ারিয়াম সামগ্রীর সমাহার।',
    shopCatalog: 'ক্যাটালগ দেখুন',
    exploreCategories: 'ক্যাটাগরি সমূহ',

    // Categories Component
    popularCategories: 'জনপ্রিয় ক্যাটাগরি',
    everythingYouNeed: 'আপনার স্বপ্নের অ্যাকোয়ারিয়াম তৈরি ও পরিচর্যার সেরা সমাধান।',
    viewAll: 'সব দেখুন',
    exploreCollection: 'সংগ্রহ দেখুন',

    // Featured Component
    handpickedSelections: 'সেরা কালেকশন',
    featuredProducts: 'বিশেষ আকর্ষণীয় পণ্য',
    exploreAllProducts: 'সব পণ্য দেখুন',
    orderNow: 'অর্ডার করুন',

    // Products Page
    aquaticProductsBannerTitle: 'অ্যাকোয়ারিয়াম পণ্য ও সামগ্রী',
    aquaticProductsBannerSubtitle: 'সারাদেশে সেরা মানের প্ল্যান্টস, রঙিন মাছ, লাইভস্টক, খাবার এবং একুয়াস্কেপিং সামগ্রী সংগ্রহ করুন।',
    loadingProducts: 'পণ্য লোড হচ্ছে...',
    noProductsFound: 'কোনো পণ্য পাওয়া যায়নি।',
    productDetails: 'পণ্যের বিস্তারিত',
    category: 'ক্যাটাগরি',
    discountOff: 'ছাড়',
    noImage: 'কোনো ছবি নেই',
    noDescription: 'এখনো কোনো পণ্যের বিবরণ যোগ করা হয়নি।',
    quantity: 'পরিমাণ',
    availability: 'স্টক',
    inStock: 'স্টকে আছে',
    outOfStock: 'স্টকে নেই',
    stock: 'স্টক',
    keywords: 'কীওয়ার্ড',

    // Order Modal
    orderProduct: 'পণ্য অর্ডার',
    sendOrderRequest: 'অর্ডার মেসেজ পাঠান',
    chooseWhereToSend: 'আপনার সুবিধাজনক প্ল্যাটফর্মে অর্ডার করুন:',
    sendInWhatsapp: 'হোয়াটসঅ্যাপে পাঠান (01787-283804)',
    sendInMessenger: 'মেসেঞ্জারে পাঠান',
    visitFacebookPage: 'ফেসবুক পেজ ভিজিট করুন',
    callHotline: 'হটলাইনে কল করুন: 01787-283804',

    // Footer
    brandFooterDesc: 'উন্নত মানের একুয়াস্কেপিং পণ্য, এক্সোটিক মাছ, জলজ উদ্ভিদ ও সেরা অ্যাকোয়ারিয়াম সরঞ্জামের নির্ভরযোগ্য বিশ্বস্ত প্রতিষ্ঠান।',
    quickNavigation: 'দ্রুত নেভিগেশন',
    customerSupport: 'কাস্টমার সাপোর্ট',
    qualityGuaranteed: '১০০% কোয়ালিটি গ্যারান্টি',
    allRightsReserved: 'অ্যাকুয়া ফিন্স বাংলাদেশ। সর্বস্বত্ব সংরক্ষিত।',
    createdBy: 'তৈরি করেছে',

    // About Page
    aboutTitle: 'অ্যাকুয়া ফিন্স বাংলাদেশ সম্পর্কে',
    aboutSubtitle: 'উন্নত মানের একুয়াস্কেপিং পণ্য, এক্সোটিক মাছ, জলজ উদ্ভিদ ও সেরা অ্যাকোয়ারিয়াম সরঞ্জামের নির্ভরযোগ্য বিশ্বস্ত প্রতিষ্ঠান।',
    whoWeAre: 'আমাদের পরিচিতি',
    passionateTitle: 'জলজ পরিবেশ ও অ্যাকোয়ারিয়ামের অনুরাগী',
    passionateDesc1: 'অ্যাকুয়া ফিন্স বাংলাদেশ একটি সুনির্দিষ্ট লক্ষ্য নিয়ে গঠিত: বাংলাদেশের অ্যাকোয়ারিয়ামপ্রেমী ও একুয়াস্কেপারদের কাছে উন্নত মানের সুস্থ জলজ প্রাণী এবং সেরা অ্যাকোয়ারিয়াম সরঞ্জাম পৌঁছে দেওয়া।',
    passionateDesc2: 'আপনি নতুন অ্যাকোয়ারিয়াম শুরু করছেন বা প্রদর্শনীর মানের প্ল্যান্টেড ট্যাংক বানাচ্ছেন, সঠিক দিকনির্দেশনা ও সারা বাংলাদেশে নির্ভরযোগ্য ডেলিভারির সাথে আমরা আছি আপনার পাশে।',
    browseProducts: 'পণ্য ক্যাটালগ দেখুন',
    exoticFishTitle: 'এক্সোটিক মাছ ও লাইভস্টক',
    exoticFishDesc: 'সুস্থ ও রঙিন প্রিমিয়াম বেটা, টেট্রা, চিংড়ি এবং অপরাপর লাইভস্টক।',
    livePlantsTitle: 'একুয়াটিক প্ল্যান্টস',
    livePlantsDesc: 'উন্নত মানের প্ল্যান্টস, তাজা মস এবং একুয়াস্কেপিং উদ্ভিদ।',
    equipmentTitle: 'সরঞ্জাম ও ফিল্টার',
    equipmentDesc: 'মানসম্পন্ন ফিল্টার, ডব্লিউআরজিবি লাইট, অ্যাকোয়ারিয়াম খাবার এবং প্রয়োজনীয় সরঞ্জাম।',
    nationwideTitle: 'সারাদেশে হোম ডেলিভারি',
    nationwideDesc: 'নিরাপদ প্যাকেজিং ও দ্রুততম সময়ে সারাদেশে নিশ্চিত ডেলিভারি।',
    getInTouch: 'যোগাযোগ করুন',
  },
};

const LanguageContext = createContext({
  lang: 'en',
  toggleLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('aquafins_lang');
    if (saved === 'en' || saved === 'bn') {
      setLang(saved);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'bn' ? 'en' : 'bn';
      localStorage.setItem('aquafins_lang', next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key) => {
      if (translations[lang] && translations[lang][key]) {
        return translations[lang][key];
      }
      return translations.en[key] || key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
