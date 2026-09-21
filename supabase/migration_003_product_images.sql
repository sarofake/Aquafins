-- =============================================================================
-- Aqua Fins — SQL migration 003: Add images JSONB column to products table
-- HOW TO RUN: Supabase Dashboard -> your project -> SQL Editor -> New query
--             -> paste this whole file -> Run.
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Add images column (JSONB array of image objects)
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists images jsonb not null default '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- 2. Migrate existing single image into images array
-- ---------------------------------------------------------------------------
update public.products
set images = jsonb_build_array(
  jsonb_build_object(
    'url', image,
    'is_default', true
  )
)
where image is not null and image != '' and images = '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- 3. Ensure image column still works (set to first image in array if missing)
-- ---------------------------------------------------------------------------
update public.products
set image = (
  select url from jsonb_array_elements_text(images) as url limit 1
)
where (image is null or image = '') and jsonb_array_length(images) > 0;

commit;
