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
    combo: 'Combo',
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
    pageComingSoonSubtitle: 'This page is under construction. Stay tuned for updates!',
    howToBuy: 'How to Buy',
    deliveryPackaging: 'Delivery & Packaging',
    termsConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    contactUs: 'Contact Us',

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
    carouselPrev: 'Previous categories',
    carouselNext: 'Next categories',

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
    sendInWhatsapp: 'Send in WhatsApp',
    sendInMessenger: 'Send in Messenger',
    visitFacebookPage: 'Visit Facebook Page',
    callHotline: 'Call Hotline',

    // Footer
    brandFooterDesc: 'Your trusted partner for high-grade aquascaping products, exotic fish, healthy aquatic flora, and professional equipment nationwide.',
    quickNavigation: 'Quick Navigation',
    information: 'Information',
    customerSupport: 'Customer Support',
    supportedPayments: 'Supported Payment Methods',
    mobileBanking: 'Mobile Banking',
    bankTransfer: 'Bank & Card Transfer',
    qualityGuaranteed: '100% Quality Guaranteed',
    allRightsReserved: 'Aqua Fins Bangladesh. All rights reserved.',
    createdBy: 'Created by',

    // About Page
    aboutTitle: 'About Aqua Fins Bangladesh',
    aboutSubtitle: 'Your trusted partner for high-grade aquascaping products, exotic fish, healthy aquatic flora, and professional equipment nationwide.',
    aboutBrandTitle: 'Aqua Fins Bangladesh',
    aboutIntro1: 'Aqua Fins Bangladesh is a reliable aquatic platform for aquarium lovers and everyone curious about aquatic life. Fish, aquatic plants, shrimp, livestock, aquarium food, scaping materials and essential accessories — delivering everything in one place, easily and trustworthily, is our goal.',
    aboutIntro2: 'We believe an aquarium is not just a glass box; it is a small living world. The beauty of fish, the natural growth of plants, the movement of shrimp and a beautiful Aquascape — together they bring a unique touch of nature into your room.',
    aboutGoalTitle: 'Our Goal',
    aboutGoalDesc: 'Our main goal is to make the aquarium and Aquascaping hobby in Bangladesh easier, more beautiful and enjoyable for everyone. From new hobbyists to experienced aquarists — we try to supply quality live animals, aquatic plants and aquarium products for every need.',
    aboutSpecialtyTitle: 'Our Specialties',
    aboutSpecialtyDesc1: 'For us, the quality of every living creature and plant and their safe transport matter greatly. Before delivering fish and other live products, the necessary observation, conditioning and preparation are completed so they can reach their new environment safely.',
    aboutSpecialtyDesc2: 'At the same time, we work with various species of aquatic plants, shrimp and aquascaping materials, and strive to create new and attractive collections for hobbyists.',
    aboutJourneyTitle: 'Your Journey With Us',
    aboutJourneyDesc1: 'Whether you are a new aquarium hobbyist setting up your first tank, or an experienced aquarist looking to build a new collection — Aqua Fins Bangladesh wants to be a trusted companion on your aquatic journey.',
    aboutJourneyDesc2: 'Our purpose is not just to sell products, but to build a beautiful Aquatic Hobby Culture where people can keep the beauty of nature in their own homes.',
    aboutTagline: 'Aqua Fins Bangladesh — Bringing the beauty of the underwater world to your home.',
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

    // Contact Section
    contactHeaderSubtitle: 'Have Questions or Special Requests?',
    contactHeaderTitle: 'Get In Touch With Us',
    contactDesc: 'Whether you need advice on setting up an aquarium, inquiry on live plant stock, or custom order support, our team is ready to assist you.',
    yourName: 'Your Full Name',
    yourPhone: 'Phone / Mobile Number',
    yourEmail: 'Email Address (Optional)',
    selectTopic: 'Select Inquiry Topic',
    generalInquiry: 'General Inquiry',
    orderStatus: 'Order Inquiry / Custom Request',
    aquascapingConsult: 'Aquascaping & Plant Advice',
    livestockQuery: 'Fish & Livestock Availability',
    yourMessage: 'Message',
    messagePlaceholder: 'Write your message or inquiry here...',
    sendMessage: 'Send Message',
    messageSending: 'Sending Message...',
    messageSentSuccess: 'Thank you! Your message has been sent successfully.',
    messageSentDesc: 'We will respond to your query as soon as possible.',
    orDirectContact: 'Or Connect Directly',
    whatsappDirect: 'Chat on WhatsApp',
    callUsDirect: 'Call Us Now',
    messengerDirect: 'Send Messenger Message',
    businessHours: 'Business Hours',
    businessHoursTime: 'Daily: 10:00 AM – 10:00 PM',
    locationTitle: 'Location & Delivery',
    locationDesc: 'Dhaka, Bangladesh (Express nationwide delivery)',
    sendOnWhatsappOption: 'Send via WhatsApp',
    deliveryInfoTitle: 'Delivery Information',
    returnPolicyTitle: 'Return Policy',
    minimumOrder: 'Minimum order',
    findUs: 'Find Us',
    supportLabel: 'Support',
    alternatePhoneLabel: 'Alternate',
    emailLabel: 'Email',
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
    combo: 'কম্বো',
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
    pageComingSoonSubtitle: 'এই পেজটি নির্মাণাধীন। আপডেটের জন্য অপেক্ষা করুন!',
    howToBuy: 'কেভাবে কিনবেন',
    deliveryPackaging: 'ডেলিভারি ও প্যাকেজিং',
    termsConditions: 'শর্তাবলি',
    privacyPolicy: 'প্রাইভেসি পলিসি',
    contactUs: 'যোগাযোগ করুন',

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
    carouselPrev: 'আগের ক্যাটাগরি',
    carouselNext: 'পরের ক্যাটাগরি',

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
    sendInWhatsapp: 'হোয়াটসঅ্যাপে পাঠান',
    sendInMessenger: 'মেসেঞ্জারে পাঠান',
    visitFacebookPage: 'ফেসবুক পেজ ভিজিট করুন',
    callHotline: 'হটলাইনে কল করুন',

    // Footer
    brandFooterDesc: 'উন্নত মানের একুয়াস্কেপিং পণ্য, এক্সোটিক মাছ, জলজ উদ্ভিদ ও সেরা অ্যাকোয়ারিয়াম সরঞ্জামের নির্ভরযোগ্য বিশ্বস্ত প্রতিষ্ঠান।',
    quickNavigation: 'দ্রুত নেভিগেশন',
    information: 'তথ্য',
    customerSupport: 'কাস্টমার সাপোর্ট',
    supportedPayments: 'গৃহীত পেমেন্ট মাধ্যমসমূহ',
    mobileBanking: 'মোবাইল ব্যাংকিং',
    bankTransfer: 'ব্যাংক ও কার্ড ট্রান্সফার',
    qualityGuaranteed: '১০০% কোয়ালিটি গ্যারান্টি',
    allRightsReserved: 'অ্যাকুয়া ফিন্স বাংলাদেশ। সর্বস্বত্ব সংরক্ষিত।',
    createdBy: 'তৈরি করেছে',

    // About Page
    aboutTitle: 'আমাদের সম্পর্কে',
    aboutSubtitle: 'উন্নত মানের একুয়াস্কেপিং পণ্য, এক্সোটিক মাছ, জলজ উদ্ভিদ ও সেরা অ্যাকোয়ারিয়াম সরঞ্জামের নির্ভরযোগ্য বিশ্বস্ত প্রতিষ্ঠান।',
    aboutBrandTitle: 'Aqua Fins Bangladesh',
    aboutIntro1: 'Aqua Fins Bangladesh হলো অ্যাকোয়ারিয়ামপ্রেমী ও জলজ জীবনের প্রতি আগ্রহী মানুষের জন্য একটি নির্ভরযোগ্য অ্যাকুয়াটিক প্ল্যাটফর্ম। মাছ, জলজ উদ্ভিদ, শ্রিম্প, লাইভস্টক, অ্যাকোয়ারিয়াম ফুড, স্ক্যাপিং উপকরণ ও প্রয়োজনীয় অ্যাক্সেসরিজ—সবকিছু এক জায়গায় সহজে ও বিশ্বস্ততার সঙ্গে পৌঁছে দেওয়াই আমাদের লক্ষ্য।',
    aboutIntro2: 'আমরা বিশ্বাস করি, একটি অ্যাকোয়ারিয়াম শুধু একটি কাচের বাক্স নয়; এটি একটি ছোট্ট জীবন্ত জগৎ। মাছের সৌন্দর্য, গাছের স্বাভাবিক বৃদ্ধি, শ্রিম্পের চলাচল এবং একটি সুন্দর Aquascape—সব মিলিয়ে একটি অ্যাকোয়ারিয়াম ঘরের পরিবেশে এনে দিতে পারে প্রকৃতির এক অনন্য সৌন্দর্য।',
    aboutGoalTitle: 'আমাদের লক্ষ্য',
    aboutGoalDesc: 'আমাদের মূল লক্ষ্য হলো বাংলাদেশে অ্যাকোয়ারিয়াম ও Aquascaping Hobby-কে আরও সহজ, সুন্দর এবং সবার জন্য উপভোগ্য করে তোলা। নতুন Hobbyist থেকে শুরু করে অভিজ্ঞ Aquarist—সবার প্রয়োজন অনুযায়ী মানসম্মত জীবন্ত প্রাণী, জলজ উদ্ভিদ এবং অ্যাকোয়ারিয়াম পণ্য সরবরাহ করার চেষ্টা করি।',
    aboutSpecialtyTitle: 'আমাদের বিশেষত্ব',
    aboutSpecialtyDesc1: 'আমাদের কাছে প্রতিটি জীবন্ত প্রাণী ও উদ্ভিদের মান এবং নিরাপদ পরিবহন অত্যন্ত গুরুত্বপূর্ণ। মাছ ও অন্যান্য Live Product ডেলিভারির আগে প্রয়োজনীয় পর্যবেক্ষণ, কন্ডিশনিং এবং প্রস্তুতি সম্পন্ন করার চেষ্টা করা হয়, যাতে সেগুলো নিরাপদে নতুন পরিবেশে পৌঁছাতে পারে।',
    aboutSpecialtyDesc2: 'একই সঙ্গে আমরা বিভিন্ন প্রজাতির জলজ উদ্ভিদ, শ্রিম্প এবং Aquascaping-এর উপযোগী উপকরণ নিয়ে কাজ করি এবং Hobbyist-দের জন্য নতুন ও আকর্ষণীয় সংগ্রহ তৈরি করার চেষ্টা করি।',
    aboutJourneyTitle: 'আমাদের সঙ্গে আপনার যাত্রা',
    aboutJourneyDesc1: 'আপনি যদি একজন নতুন Aquarium Hobbyist হন, নিজের প্রথম Tank সাজাতে চান, অথবা একজন অভিজ্ঞ Aquarist হিসেবে নতুন কিছু সংগ্রহ করতে চান—Aqua Fins Bangladesh আপনার Aquatic Journey-এর একজন বিশ্বস্ত সহযোগী হতে চায়।',
    aboutJourneyDesc2: 'আমাদের উদ্দেশ্য শুধু পণ্য বিক্রি করা নয়; বরং একটি সুন্দর Aquatic Hobby Culture গড়ে তোলা, যেখানে মানুষ প্রকৃতির সৌন্দর্যকে নিজের ঘরে ধারণ করতে পারে।',
    aboutTagline: 'Aqua Fins Bangladesh — Bringing the beauty of the underwater world to your home.',
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

    // Contact Section
    contactHeaderSubtitle: 'কোনো প্রশ্ন বা বিশেষ অনুসন্ধানের জন্য?',
    contactHeaderTitle: 'আমাদের সাথে যোগাযোগ করুন',
    contactDesc: 'নতুন অ্যাকোয়ারিয়াম সেটআপ, তাজা জলজ উদ্ভিদ, মাছের স্টক বা বিশেষ অর্ডারের জন্য আমাদের সাথে নির্দ্বিধায় বার্তা পাঠান।',
    yourName: 'আপনার পুরো নাম',
    yourPhone: 'ফোন নম্বর',
    yourEmail: 'ইমেইল অ্যাড্রেস (ঐচ্ছিক)',
    selectTopic: 'বিষয় নির্বাচন করুন',
    generalInquiry: 'সাধারণ অনুসন্ধান',
    orderStatus: 'অর্ডার / কাস্টম রিকোয়েস্ট',
    aquascapingConsult: 'একুয়াস্কেপিং ও প্ল্যান্ট পরামর্শ',
    livestockQuery: 'মাছ ও লাইভস্টক তথ্য',
    yourMessage: 'বার্তা / মেসেজ',
    messagePlaceholder: 'আপনার বার্তা বা প্রশ্নটি এখানে বিস্তারিত লিখুন...',
    sendMessage: 'মেসেজ পাঠান',
    messageSending: 'পাঠানো হচ্ছে...',
    messageSentSuccess: 'ধন্যবাদ! আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে।',
    messageSentDesc: 'আমরা দ্রুততম সময়ে আপনার সাথে যোগাযোগ করব।',
    orDirectContact: 'সরাসরি যোগাযোগ করুন',
    whatsappDirect: 'হোয়াটসঅ্যাপে চ্যাট করুন',
    callUsDirect: 'কল করুন',
    messengerDirect: 'মেসেঞ্জারে মেসেজ দিন',
    businessHours: 'খোলা থাকার সময়',
    businessHoursTime: 'প্রতিদিন: সকাল ১০:০০টা – রাত ১০:০০টা',
    locationTitle: 'ঠিকানা ও ডেলিভারি',
    locationDesc: 'ঢাকা, বাংলাদেশ (সারাদেশে দ্রুত ডেলিভারি)',
    sendOnWhatsappOption: 'হোয়াটসঅ্যাপে পাঠান',
    deliveryInfoTitle: 'ডেলিভারি তথ্য',
    returnPolicyTitle: 'রিটার্ন পলিসি',
    minimumOrder: 'সর্বনিম্ন অর্ডার',
    findUs: 'আমাদের ঠিকানা',
    supportLabel: 'সাপোর্ট',
    alternatePhoneLabel: 'বিকল্প ফোন',
    emailLabel: 'ইমেইল',
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
