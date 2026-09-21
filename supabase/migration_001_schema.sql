-- =============================================================================
-- Aqua Fins — SQL migration 001: Supabase database schema with Mother Categories
-- HOW TO RUN: Supabase Dashboard -> your project -> SQL Editor -> New query
--             -> paste this whole file -> Run.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. categories table
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          bigint generated always as identity primary key,
  name        text not null,
  slug        text not null unique,
  icon        text not null default 'Fish',
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. products table
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id            bigint generated always as identity primary key,
  name          text not null,
  category      text not null,                  -- slug: plants | fish | livestock | food-accessories | scaping
  price         numeric(10,2) not null,
  description   text not null default '',
  image         text not null,                  -- Cloudinary delivery URL
  image_public_id text,                         -- Cloudinary public_id (for deletes)
  featured      boolean not null default false,
  available     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_featured_idx  on public.products (featured);

-- Row Level Security
alter table public.categories enable row level security;
alter table public.products     enable row level security;

-- Public read policies
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select using (true);

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select using (true);

-- ---------------------------------------------------------------------------
-- 3. Seed Mother Categories
-- ---------------------------------------------------------------------------
insert into public.categories (name, slug, icon, description, sort_order)
values
  ('Plants',             'plants',            'Leaf',     'Live Aquatic Plants & Moss',                 1),
  ('Fish',               'fish',              'Fish',     'Bettas & Exotic Freshwater Fish',           2),
  ('Livestock',          'livestock',         'Shell',    'Shrimps, Snails & Invertebrates',           3),
  ('Food & Accessories', 'food-accessories',  'Utensils', 'Pellets, Flakes, Filters & LED Lighting', 4),
  ('Scaping',            'scaping',           'Mountain', 'Aquascaping Rocks, Driftwood & Substrates', 5)
on conflict (slug) do update set
  name = excluded.name,
  icon = excluded.icon,
  description = excluded.description,
  sort_order = excluded.sort_order;

commit;
