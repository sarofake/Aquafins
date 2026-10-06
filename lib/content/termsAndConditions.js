const termsAndConditions = {
  en: {
    title: 'Terms & Conditions',
    subtitle: 'Please read our terms and conditions before placing an order.',
    sections: [
      { type: 'heading', text: '1. Order Confirmation' },
      {
        type: 'paragraph',
        text: 'The specified advance payment is mandatory to confirm an order.',
      },
      {
        type: 'list',
        items: [
          '**Inside Dhaka City:** ৳120',
          '**Dhaka Sub-areas:** ৳130',
          '**Outside Dhaka District:** ৳150',
        ],
      },
      {
        type: 'paragraph',
        text: 'No order will be accepted or confirmed without advance payment.',
      },
      { type: 'heading', text: '2. Delivery Time' },
      { type: 'subheading', text: '🐟 For Fish' },
      {
        type: 'paragraph',
        text: 'Fish usually require **12–24 hours** for observation, necessary conditioning and preparation for safe delivery. After that, it typically takes **2–3 days** for the package to reach your address through the delivery company.',
      },
    ],
  },
  bn: {
    title: 'শর্তাবলি',
    subtitle: 'অর্ডার করার আগে আমাদের শর্তাবলি ভালোভাবে পড়ে নিন।',
    sections: [
      { type: 'heading', text: '১. অর্ডার কনফার্মেশন' },
      {
        type: 'paragraph',
        text: 'অর্ডার নিশ্চিত করার জন্য নির্ধারিত অগ্রিম অর্থ প্রদান বাধ্যতামূলক।',
      },
      {
        type: 'list',
        items: [
          '**ঢাকা সিটির ভিতরে:** ৳১২০',
          '**ঢাকার সাব-এরিয়ায়:** ৳১৩০',
          '**ঢাকা জেলার বাইরে:** ৳১৫০',
        ],
      },
      {
        type: 'paragraph',
        text: 'অগ্রিম অর্থ প্রদান ছাড়া কোনো অর্ডার গ্রহণ বা কনফার্ম করা হবে না।',
      },
      { type: 'heading', text: '২. ডেলিভারি সময়' },
      { type: 'subheading', text: '🐟 মাছের ক্ষেত্রে' },
      {
        type: 'paragraph',
        text: 'মাছকে পর্যবেক্ষণ, প্রয়োজনীয় কন্ডিশনিং এবং নিরাপদ ডেলিভারির জন্য প্রস্তুত করতে সাধারণত **১২–২৪ ঘণ্টা** সময় প্রয়োজন হয়। এরপর ডেলিভারি কোম্পানির মাধ্যমে আপনার ঠিকানায় পৌঁছাতে সাধারণত **২–৩ দিন** সময় লাগে।',
      },
    ],
  },
};

export default termsAndConditions;
