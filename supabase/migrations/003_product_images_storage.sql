begin;

-- Fotografías comerciales públicas. No guardar documentos privados aquí.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Requiere 002_administradores.sql y public.is_admin().
drop policy if exists "Lucyne admins read product files" on storage.objects;
create policy "Lucyne admins read product files"
  on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

drop policy if exists "Lucyne admins upload product files" on storage.objects;
create policy "Lucyne admins upload product files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));

-- Se usa para limpiar una subida si no puede registrarse en product_images.
drop policy if exists "Lucyne admins delete product files" on storage.objects;
create policy "Lucyne admins delete product files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

commit;
