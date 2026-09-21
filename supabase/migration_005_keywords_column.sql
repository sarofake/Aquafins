-- =============================================================================
-- Aqua Fins — SQL migration 005: Add keywords & quantity columns to products
-- HOW TO RUN: Supabase Dashboard -> your project -> SQL Editor -> New query
--             -> paste this whole file -> Run.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Add keywords column (comma separated search keywords, any language)
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists keywords text not null default '';

-- ---------------------------------------------------------------------------
-- 2. Add quantity columns (EN/BN labels, e.g. "10 pcs", "৫০০ গ্রাম")
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists quantity text not null default '';

alter table public.products
  add column if not exists quantity_bn text not null default '';

commit;