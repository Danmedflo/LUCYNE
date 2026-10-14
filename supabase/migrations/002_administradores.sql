begin;

-- CUENTAS AUTORIZADAS PARA ADMINISTRAR
create table public.admin_users (
  user_id uuid primary key references auth.users(id)
    on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Nadie puede darse permisos de administrador desde la web.
revoke all privileges on public.admin_users
from anon, authenticated;

grant select on public.admin_users to authenticated;

create policy "Users can check their own admin membership"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

-- Comprueba los permisos de la cuenta actual.
create function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- PERMISOS SOBRE EL CATÁLOGO
grant insert, update, delete on table
  public.categories,
  public.products,
  public.product_variants,
  public.product_images
to authenticated;

-- Aunque una cuenta esté autenticada, estas operaciones
-- solo se permiten si pertenece a admin_users.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'categories',
    'products',
    'product_variants',
    'product_images'
  ]
  loop
    execute format(
      'create policy "Administrators can manage records"
       on public.%I
       for all
       to authenticated
       using ((select public.is_admin()))
       with check ((select public.is_admin()))',
      table_name
    );
  end loop;
end;
$$;

commit;