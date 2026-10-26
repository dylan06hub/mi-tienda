-- Esquema base de "norte." para Supabase/PostgreSQL.
-- Los pedidos se crean desde el servidor con service_role; RLS no habilita
-- inserción pública.

begin;

create table public.productos (
  id text primary key,
  nombre text not null,
  descripcion text,
  precio numeric(12, 2) not null check (precio >= 0),
  categoria text not null,
  imagen text,
  activo boolean not null default true
);

-- variantes.id es text y la PK es (producto_id, id): el id de la app es
-- relativo a cada producto (por ejemplo, "s-negro" se repite).
create table public.variantes (
  id text not null,
  producto_id text not null references public.productos(id) on delete cascade,
  talle text not null,
  color text not null,
  stock integer not null default 0 check (stock >= 0),
  primary key (producto_id, id),
  unique (producto_id, talle, color)
);

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'pagado', 'cancelado', 'enviado')),
  total numeric(12, 2) not null check (total >= 0),
  nombre text not null,
  email text not null,
  telefono text,
  direccion text,
  mp_payment_id text,
  creado_en timestamptz not null default now()
);

create table public.items_pedido (
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  producto_id text not null,
  -- restrict conserva el historial: no se borra una variante con pedidos.
  variante_id text not null,
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric(12, 2) not null check (precio_unitario >= 0),
  primary key (pedido_id, producto_id, variante_id),
  foreign key (producto_id, variante_id)
    references public.variantes(producto_id, id) on delete restrict
);

create index items_pedido_variante_idx on public.items_pedido(producto_id, variante_id);

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.productos enable row level security;
alter table public.variantes enable row level security;
alter table public.pedidos enable row level security;
alter table public.items_pedido enable row level security;
alter table public.admins enable row level security;

-- security definer permite consultar admins sin darle select al cliente.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from PUBLIC;
grant execute on function public.is_admin() to authenticated;

-- Catálogo público: cualquiera ve solo productos activos.
create policy "productos_activos_lectura_publica"
on public.productos
for select
to anon, authenticated
using (activo = true);

-- Admins: ven todos los productos (también inactivos) y pueden escribirlos.
create policy "productos_admin_todos"
on public.productos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Variantes públicas: solo si el producto padre está activo.
create policy "variantes_producto_activo_lectura_publica"
on public.variantes
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.productos
    where productos.id = variantes.producto_id
      and productos.activo = true
  )
);

-- Admins: ven todas las variantes, incluso las de productos inactivos.
create policy "variantes_admin_todos"
on public.variantes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Pedidos: solo lectura para admins; sin acceso público ni escritura cliente.
create policy "pedidos_admin_lectura"
on public.pedidos
for select
to authenticated
using (public.is_admin());

-- Detalle del pedido: misma regla que pedidos, sin acceso público.
create policy "items_pedido_admin_lectura"
on public.items_pedido
for select
to authenticated
using (public.is_admin());

-- admins queda con RLS y sin políticas: solo service_role (e is_admin()) accede.

-- Permisos base. RLS sigue filtrando cada operación.
grant usage on schema public to anon, authenticated;
grant select on public.productos, public.variantes to anon, authenticated;
grant insert, update, delete on public.productos, public.variantes to authenticated;
grant select on public.pedidos, public.items_pedido to authenticated;

commit;
