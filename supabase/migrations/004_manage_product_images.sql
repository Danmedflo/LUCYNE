begin;

-- Conserva eliminaciones pendientes si Storage no responde.
-- Sin FK al producto para no perder el pendiente si se borra el producto.
create table if not exists public.product_image_deletions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  image_id uuid not null unique,
  storage_path text not null unique,
  label text not null default '',
  created_at timestamptz not null default now(),
  constraint product_image_deletion_path
    check (storage_path like product_id::text || '/%')
);

create index if not exists product_image_deletions_product_idx
  on public.product_image_deletions(product_id);

alter table public.product_image_deletions enable row level security;
revoke all on table public.product_image_deletions from anon, authenticated;
grant select, insert, update, delete on public.product_image_deletions to authenticated;

drop policy if exists "Lucyne admins manage pending image deletions"
  on public.product_image_deletions;
create policy "Lucyne admins manage pending image deletions"
  on public.product_image_deletions for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Cambia toda la ordenación en una sola transacción.
create or replace function public.lucyne_set_product_cover(
  p_product_id uuid,
  p_image_id uuid
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Administrator required' using errcode = '42501';
  end if;

  perform id from public.products where id = p_product_id for update;
  if not found then
    raise exception 'Product not found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from public.product_images
    where id = p_image_id and product_id = p_product_id
  ) then
    raise exception 'Image not found in product' using errcode = 'P0002';
  end if;

  with ranked as (
    select id,
      (row_number() over (
        order by
          case when id = p_image_id then 0 else 1 end,
          sort_order, created_at, id
      ) - 1)::integer as position
    from public.product_images
    where product_id = p_product_id
  )
  update public.product_images as images
    set sort_order = ranked.position
    from ranked
    where images.id = ranked.id and images.product_id = p_product_id;
end;
$$;

-- Retira la foto y registra el archivo pendiente de borrar, de forma atómica.
-- La eliminación física se hace con Storage API, nunca modificando storage.objects.
create or replace function public.lucyne_remove_product_image(
  p_product_id uuid,
  p_image_id uuid
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_path text;
  v_label text;
  v_deletion_id uuid;
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Administrator required' using errcode = '42501';
  end if;

  perform id from public.products where id = p_product_id for update;
  if not found then
    raise exception 'Product not found' using errcode = 'P0002';
  end if;

  delete from public.product_images
    where id = p_image_id and product_id = p_product_id
    returning storage_path, alt_text into v_path, v_label;

  if not found then
    -- Un reintento tras perder la respuesta puede recuperar el mismo pendiente.
    select id into v_deletion_id from public.product_image_deletions
      where image_id = p_image_id and product_id = p_product_id;
    if v_deletion_id is not null then
      return v_deletion_id;
    end if;
    raise exception 'Image not found in product' using errcode = 'P0002';
  end if;

  insert into public.product_image_deletions(product_id, image_id, storage_path, label)
    values (p_product_id, p_image_id, v_path, coalesce(v_label, ''))
    returning id into v_deletion_id;

  return v_deletion_id;
end;
$$;

revoke all on function public.lucyne_set_product_cover(uuid, uuid) from public, anon;
revoke all on function public.lucyne_remove_product_image(uuid, uuid) from public, anon;
grant execute on function public.lucyne_set_product_cover(uuid, uuid) to authenticated;
grant execute on function public.lucyne_remove_product_image(uuid, uuid) to authenticated;

commit;
