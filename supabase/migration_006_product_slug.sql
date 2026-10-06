-- =============================================================================
-- Aqua Fins — SQL migration 006: Add slug column to products
--          Gives every product its own shareable URL:
--          /products/<category>/<slug>
-- HOW TO RUN: Supabase Dashboard -> your project -> SQL Editor -> New query
--             -> paste this whole file -> Run.
-- Safe to re-run (idempotent).
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Add the slug column (nullable for now so backfill can run first)
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists slug text;

-- ---------------------------------------------------------------------------
-- 2. Backfill: generate a URL-safe slug from the product name.
--    - lowercase, non-alphanumeric runs collapsed to single "-"
--    - leading/trailing dashes trimmed
--    - Bangla-only names (no ASCII) fall back to "product-<id>"
--    - duplicates get "-2", "-3", ... suffixes
--    - rows that already have a slug are left untouched
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
  base text;
  final text;
  n integer;
begin
  for r in
    select id, name
    from public.products
    where slug is null or slug = ''
    order by id
  loop
    base := nullif(
      trim(both '-' from regexp_replace(lower(trim(coalesce(r.name, ''))), '[^a-z0-9]+', '-', 'g')),
      ''
    );
    if base is null then
      base := 'product-' || r.id;
    end if;

    final := base;
    n := 2;
    while exists (select 1 from public.products p where p.slug = final) loop
      final := base || '-' || n;
      n := n + 1;
    end loop;

    update public.products set slug = final where id = r.id;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Enforce: every product must have a slug, and slugs must be unique
-- ---------------------------------------------------------------------------
alter table public.products
  alter column slug set not null;

create unique index if not exists products_slug_key
  on public.products (slug);

commit;
