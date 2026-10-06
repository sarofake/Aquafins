-- =============================================================================
-- Aqua Fins — Consolidated Database Schema (Serverless-Optimized)
-- Run this ONCE on a fresh Supabase project. For existing DB, see notes below.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. categories (mother + sub-categories via parent_id)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id              bigint generated always as identity primary key,
  name            text not null,
  name_bn         text not null default '',
  slug            text not null unique,
  icon            text not null default 'Fish',
  description     text not null default '',
  description_bn  text not null default '',
  parent_id       bigint references public.categories(id) on delete set null,
  image           text not null default '',
  image_public_id text not null default '',
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists categories_parent_idx   on public.categories (parent_id);
create index if not exists categories_sort_idx     on public.categories (sort_order);

-- ---------------------------------------------------------------------------
-- 2. products (serverless-friendly with proper indexes)
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id              bigint generated always as identity primary key,
  name            text not null,
  name_bn         text not null default '',
  slug            text not null,
  category        text not null default '',
  category_id     bigint references public.categories(id) on delete set null,
  price           numeric(10,2) not null,
  original_price  numeric(10,2),
  description     text not null default '',
  description_bn  text not null default '',
  image           text not null default '',
  images          jsonb not null default '[]'::jsonb,
  image_public_id text not null default '',
  keywords        text not null default '',
  quantity        text not null default '',
  quantity_bn     text not null default '',
  featured        boolean not null default false,
  deals           boolean not null default false,
  available       boolean not null default true,
  updated_at      timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

-- Query-optimized indexes (covers all public + admin queries)
create unique index if not exists products_slug_key    on public.products (slug);
create index if not exists products_category_idx      on public.products (category);
create index if not exists products_category_id_idx   on public.products (category_id);
create index if not exists products_featured_idx      on public.products (featured) where featured is true;
create index if not exists products_deals_idx         on public.products (deals) where deals is true;
create index if not exists products_available_idx     on public.products (available);
create index if not exists products_created_at_idx    on public.products (created_at desc);
create index if not exists products_available_created on public.products (available, created_at desc);

-- GIN index for JSONB image queries
create index if not exists products_images_idx on public.products using gin (images);

-- ---------------------------------------------------------------------------
-- 3. hero_slides (carousel banners)
-- ---------------------------------------------------------------------------
create table if not exists public.hero_slides (
  id              bigint generated always as identity primary key,
  title           text not null,
  title_bn        text not null default '',
  subtitle        text not null default '',
  subtitle_bn     text not null default '',
  badge           text not null default '',
  badge_bn        text not null default '',
  image           text not null default '',
  image_public_id text not null default '',
  button_text     text not null default 'Explore Catalog',
  button_text_bn  text not null default '',
  button_link     text not null default '/products',
  sort_order      integer not null default 0,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists hero_slides_active_sort on public.hero_slides (active, sort_order) where active is true;

-- ---------------------------------------------------------------------------
-- 4. site_info (key/value store for site-wide config)
-- ---------------------------------------------------------------------------
create table if not exists public.site_info (
  key         text primary key,
  value       text not null default '',
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. Row Level Security (public read-only, admin writes via service role)
-- ---------------------------------------------------------------------------
alter table public.categories   enable row level security;
alter table public.products     enable row level security;
alter table public.hero_slides  enable row level security;
alter table public.site_info    enable row level security;

-- Public read policies
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select using (true);

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select using (true);

drop policy if exists "hero_slides public read" on public.hero_slides;
create policy "hero_slides public read" on public.hero_slides for select using (true);

drop policy if exists "site_info public read" on public.site_info;
create policy "site_info public read" on public.site_info for select using (true);

-- ---------------------------------------------------------------------------
-- 6. Seed data
-- ---------------------------------------------------------------------------

-- Mother categories
insert into public.categories (name, slug, icon, description, sort_order)
values
  ('Plants',             'plants',            'Leaf',     'Live Aquatic Plants & Moss',                 1),
  ('Fish',               'fish',              'Fish',     'Bettas & Exotic Freshwater Fish',           2),
  ('Livestock',          'livestock',         'Shell',    'Shrimps, Snails & Invertebrates',           3),
  ('Food & Accessories', 'food-accessories',  'Utensils', 'Pellets, Flakes, Filters & LED Lighting', 4),
  ('Scaping',            'scaping',           'Mountain', 'Aquascaping Rocks, Driftwood & Substrates', 5),
  ('Combo',              'combo',             'Package',  'Bundle deals and combo packs',               6)
on conflict (slug) do update set
  name = excluded.name,
  icon = excluded.icon,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- Site info defaults
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
on conflict (key) do update set
  value = excluded.value,
  updated_at = now();

commit;
