-- Migration 008: Add Combo mother category
insert into public.categories (name, name_bn, slug, icon, description, description_bn, parent_id, sort_order, image, image_public_id)
values ('Combo', 'কম্বো', 'combo', 'Package', 'Bundle deals and combo packs', '', null, 6, '', '')
on conflict (slug) do update set
  name = excluded.name,
  name_bn = excluded.name_bn,
  icon = excluded.icon,
  description = excluded.description,
  description_bn = excluded.description_bn,
  sort_order = excluded.sort_order;
