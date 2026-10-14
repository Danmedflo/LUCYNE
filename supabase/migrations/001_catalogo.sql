begin;

-- CATEGORÍAS
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (length(trim(slug)) > 0),
  created_at timestamptz not null default now()
);

-- PRODUCTOS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id)
    on delete set null,
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (length(trim(slug)) > 0),
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  audience text not null
    check (audience in ('mujer', 'hombre', 'unisex')),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- TALLAS Y COLORES
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id)
    on delete cascade,
  size text not null check (length(trim(size)) > 0),
  color text not null check (length(trim(color)) > 0),
  color_hex text
    check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, size, color)
);

-- REFERENCIAS DE FOTOGRAFÍAS
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id)
    on delete cascade,
  storage_path text not null
    check (length(trim(storage_path)) > 0),
  alt_text text not null default '',
  sort_order integer not null default 0
    check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (product_id, storage_path)
);

-- ÍNDICES
create index products_category_idx
  on public.products(category_id);

create index products_status_created_idx
  on public.products(status, created_at desc);

create index product_images_order_idx
  on public.product_images(product_id, sort_order);

-- ACTUALIZAR FECHA DE MODIFICACIÓN
create function public.set_product_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
before update on public.products
for each row
execute function public.set_product_updated_at();

-- ACTIVAR SEGURIDAD POR FILAS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;

-- EN ESTA ETAPA LA WEB SOLO PUEDE LEER
revoke all privileges on table
  public.categories,
  public.products,
  public.product_variants,
  public.product_images
from anon, authenticated;

grant usage on schema public to anon, authenticated;

grant select on table
  public.categories,
  public.products,
  public.product_variants,
  public.product_images
to anon, authenticated;

-- CATEGORÍAS VISIBLES
create policy "Public can read categories"
on public.categories
for select
to anon, authenticated
using (true);

-- SOLO PRODUCTOS PUBLICADOS
create policy "Public can read published products"
on public.products
for select
to anon, authenticated
using (status = 'published');

-- SOLO VARIANTES DE PRODUCTOS PUBLICADOS
create policy "Public can read published variants"
on public.product_variants
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_variants.product_id
      and p.status = 'published'
  )
);

-- SOLO REFERENCIAS DE IMÁGENES DE PRODUCTOS PUBLICADOS
create policy "Public can read published images"
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and p.status = 'published'
  )
);

commit;