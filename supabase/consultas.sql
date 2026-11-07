-- Fase 3. Ejecutar después de schema.sql. No modifica datos existentes.
begin;

create table if not exists public.consultas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(btrim(nombre)) between 1 and 80),
  email text not null check (
    length(email) between 1 and 120
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  telefono text check (length(telefono) <= 40),
  asunto text not null check (length(btrim(asunto)) between 1 and 120),
  mensaje text not null check (length(btrim(mensaje)) between 1 and 1000),
  creado_en timestamptz not null default now()
);

alter table public.consultas enable row level security;
drop policy if exists consultas_admin_lectura on public.consultas;
create policy consultas_admin_lectura on public.consultas
for select to authenticated using (public.is_admin());

revoke all on public.consultas from public, anon, authenticated;
grant select on public.consultas to authenticated;
grant all on public.consultas to service_role;

commit;
