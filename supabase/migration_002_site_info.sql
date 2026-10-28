-- =============================================================================
-- Aqua Fins — SQL migration 002: site_info table for site configuration
-- HOW TO RUN: Supabase Dashboard -> your project -> SQL Editor -> New query
--             -> paste this whole file -> Run.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- site_info table — key/value store for all site-wide information
-- ---------------------------------------------------------------------------
create table if not exists public.site_info (
  key         text primary key,
  value       text not null default '',
  updated_at  timestamptz not null default now()
);

-- Row Level Security
alter table public.site_info enable row level security;

-- Public read policy
drop policy if exists "site_info public read" on public.site_info;
create policy "site_info public read" on public.site_info for select using (true);

-- Seed default rows
insert into public.site_info (key, value) values
  ('site_name',        'Aqua Fins Bangladesh'),
  ('site_tagline',     'Premium Aquatics & Supplies'),
  ('site_description', 'Discover hand-picked collection of state-of-the-art aquariums, exotic livestock, aquatic plants, and premium supplies across Bangladesh.'),
  ('logo_url',         ''),
  ('favicon_url',      ''),
  ('phone_primary',    '+880 1XXX-XXXXXX'),
  ('phone_secondary',  ''),
  ('whatsapp',         '+880 1XXX-XXXXXX'),
  ('email',            'info@aquafins.com'),
  ('email_support',    'support@aquafins.com'),
  ('address',          ''),
  ('address_bn',       ''),
  ('city',             'Dhaka'),
  ('country',          'Bangladesh'),
  ('facebook',         ''),
  ('instagram',        ''),
  ('youtube',          ''),
  ('tiktok',           ''),
  ('twitter',          ''),
  ('business_hours',   'Sat-Thu: 10AM - 9PM'),
  ('business_hours_bn','শনি-বৃহঃ: সকাল ১০টা - রাত ৯টা'),
  ('map_embed_url',    ''),
  ('primary_color',    '#00f2fe'),
  ('secondary_color',  '#0284c7'),
  ('currency',         '৳'),
  ('currency_code',    'BDT'),
  ('min_order_amount', '500'),
  ('delivery_info',    'Free delivery on orders over ৳1000 within Dhaka'),
  ('delivery_info_bn', 'ঢাকার ভেতরে ৳১০০০ এর অধিক অর্ডারে ফ্রি ডেলিভারি'),
  ('return_policy',    '7-day return policy for unused items'),
  ('return_policy_bn', 'অব্যবহৃত পণ্যের জন্য ৭ দিনের রিটার্ন পলিসি'),
  ('about_us',         'We are a team of passionate aquarists dedicated to bringing you the best aquatic life and supplies.'),
  ('about_us_bn',     'আমরা উত্সাহী একুয়ারিস্টদের একটি দল যারা আপনাকে সেরা একুয়াটিক লাইফ এবং সাপ্লাই আনতে প্রতিশ্রুতিবদ্ধ।')
on conflict (key) do nothing;

commit;
