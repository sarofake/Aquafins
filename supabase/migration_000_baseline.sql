-- =============================================================================
-- Aqua Fins Bangladesh — Consolidated Optimized Database Schema
--
-- Performance & Safety Highlights:
-- 1. Zero data loss: All operations use IF NOT EXISTS / ON CONFLICT.
-- 2. Performance-tuned indexes: Covering indexes for fast client catalog & search.
-- 3. Row-Level Security (RLS): Enabled with public read policies.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. categories (Mother categories + sub-categories)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name            TEXT NOT NULL,
  name_bn         TEXT NOT NULL DEFAULT '',
  slug            TEXT NOT NULL UNIQUE,
  icon            TEXT NOT NULL DEFAULT 'Fish',
  description     TEXT NOT NULL DEFAULT '',
  description_bn  TEXT NOT NULL DEFAULT '',
  parent_id       BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
  image           TEXT NOT NULL DEFAULT '',
  image_public_id TEXT NOT NULL DEFAULT '',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS categories_parent_idx   ON public.categories (parent_id);
CREATE INDEX IF NOT EXISTS categories_sort_idx     ON public.categories (sort_order ASC);
CREATE INDEX IF NOT EXISTS categories_slug_idx     ON public.categories (slug);

-- ---------------------------------------------------------------------------
-- 2. products (Full catalog with pricing, stock & media)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name            TEXT NOT NULL,
  name_bn         TEXT NOT NULL DEFAULT '',
  slug            TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT '',
  category_id     BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
  price           NUMERIC(10,2) NOT NULL,
  original_price  NUMERIC(10,2),
  description     TEXT NOT NULL DEFAULT '',
  description_bn  TEXT NOT NULL DEFAULT '',
  image           TEXT NOT NULL DEFAULT '',
  images          JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_public_id TEXT NOT NULL DEFAULT '',
  keywords        TEXT NOT NULL DEFAULT '',
  quantity        TEXT NOT NULL DEFAULT '',
  quantity_bn     TEXT NOT NULL DEFAULT '',
  featured        BOOLEAN NOT NULL DEFAULT false,
  deals           BOOLEAN NOT NULL DEFAULT false,
  available       BOOLEAN NOT NULL DEFAULT true,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Query-optimized composite and partial indexes
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key       ON public.products (slug);
CREATE INDEX IF NOT EXISTS products_category_idx         ON public.products (category);
CREATE INDEX IF NOT EXISTS products_category_id_idx      ON public.products (category_id);
CREATE INDEX IF NOT EXISTS products_featured_sort_idx    ON public.products (featured DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS products_deals_sort_idx       ON public.products (deals, created_at DESC) WHERE deals IS TRUE;
CREATE INDEX IF NOT EXISTS products_available_idx        ON public.products (available);
CREATE INDEX IF NOT EXISTS products_created_at_idx       ON public.products (created_at DESC);
CREATE INDEX IF NOT EXISTS products_images_gin_idx       ON public.products USING GIN (images);

-- ---------------------------------------------------------------------------
-- 3. hero_slides (Top Homepage Carousel Banners)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title           TEXT NOT NULL,
  title_bn        TEXT NOT NULL DEFAULT '',
  subtitle        TEXT NOT NULL DEFAULT '',
  subtitle_bn     TEXT NOT NULL DEFAULT '',
  badge           TEXT NOT NULL DEFAULT '',
  badge_bn        TEXT NOT NULL DEFAULT '',
  image           TEXT NOT NULL DEFAULT '',
  image_public_id TEXT NOT NULL DEFAULT '',
  button_text     TEXT NOT NULL DEFAULT 'Explore Catalog',
  button_text_bn  TEXT NOT NULL DEFAULT '',
  button_link     TEXT NOT NULL DEFAULT '/products',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hero_slides_active_sort ON public.hero_slides (sort_order ASC, created_at DESC) WHERE active IS TRUE;

-- ---------------------------------------------------------------------------
-- 4. site_info (Key-Value configuration & announcement metadata)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_info (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 5. contact_messages (Customer inquiries & order inquiries)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT NOT NULL DEFAULT '',
  topic       TEXT NOT NULL DEFAULT 'General Inquiry',
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'unread',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON public.contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_status_idx  ON public.contact_messages (status);

-- ---------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Policies
-- ---------------------------------------------------------------------------
ALTER TABLE public.categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_info         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages  ENABLE ROW LEVEL SECURITY;

-- Public read policies
DROP POLICY IF EXISTS "categories public read" ON public.categories;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "products public read" ON public.products;
CREATE POLICY "products public read" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "hero_slides public read" ON public.hero_slides;
CREATE POLICY "hero_slides public read" ON public.hero_slides FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_info public read" ON public.site_info;
CREATE POLICY "site_info public read" ON public.site_info FOR SELECT USING (true);

-- Public write policy for contact messages
DROP POLICY IF EXISTS "contact_messages public insert" ON public.contact_messages;
CREATE POLICY "contact_messages public insert" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 7. Seed Initial Baseline Data (Safe & Idempotent)
-- ---------------------------------------------------------------------------

-- Mother categories
INSERT INTO public.categories (name, slug, icon, description, sort_order)
VALUES
  ('Plants',             'plants',            'Leaf',     'Live Aquatic Plants & Moss',                 1),
  ('Fish',               'fish',              'Fish',     'Bettas & Exotic Freshwater Fish',           2),
  ('Livestock',          'livestock',         'Shell',    'Shrimps, Snails & Invertebrates',           3),
  ('Food & Accessories', 'food-accessories',  'Utensils', 'Pellets, Flakes, Filters & LED Lighting', 4),
  ('Scaping',            'scaping',           'Mountain', 'Aquascaping Rocks, Driftwood & Substrates', 5),
  ('Combo',              'combo',             'Package',  'Bundle deals and combo packs',               6)
ON CONFLICT (slug) DO UPDATE SET
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- Site info and Announcement defaults
INSERT INTO public.site_info (key, value) VALUES
  ('site_name',             'Aqua Fins Bangladesh'),
  ('site_tagline',          'Premium Aquatics & Supplies'),
  ('site_description',      'Discover hand-picked collection of state-of-the-art aquariums, exotic livestock, aquatic plants, and premium supplies across Bangladesh.'),
  ('announcement_enabled',   'true'),
  ('announcement_badge',     'SPECIAL OFFER'),
  ('announcement_badge_bn',  'বিশেষ অফার'),
  ('announcement_text',      '🎉 Welcome to Aqua Fins Bangladesh! Free delivery on all Plant & Shrimp Combo orders over ৳1500 this week! | Discover our premium aquatic plants, exotic fish & accessories.'),
  ('announcement_text_bn',   '🎉 অ্যাকুয়া ফিন্স বাংলাদেশে স্বাগতম! এই সপ্তাহে ১৫০০ টাকার বেশি কম্বো অর্ডারে ফ্রি ডেলিভারি! | আমাদের এক্সক্লুসিভ লাইভস্টক ও প্ল্যান্ট কালেকশন দেখুন।'),
  ('announcement_link',      '/products?category=combo'),
  ('currency',              '৳'),
  ('currency_code',         'BDT'),
  ('min_order_amount',      '500')
ON CONFLICT (key) DO UPDATE SET
  value = CASE
    WHEN public.site_info.value = '' THEN EXCLUDED.value
    ELSE public.site_info.value
  END,
  updated_at = now();

COMMIT;
