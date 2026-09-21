-- =============================================================================
-- Aqua Fins — SQL migration 004: Add deals column to products table
-- HOW TO RUN: Supabase Dashboard -> your project -> SQL Editor -> New query
--             -> paste this whole file -> Run.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Add deals boolean column (flags products shown on the Offer & Deals page)
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists deals boolean not null default false;

-- ---------------------------------------------------------------------------
-- 2. Partial index for quickly selecting products marked as deals
-- ---------------------------------------------------------------------------
create index if not exists products_deals_idx on public.products (deals)
  where deals is true;

commit;