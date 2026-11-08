-- Retirar prendas sin perder variantes, reservas ni historial de compras.
begin;
alter table public.productos
  add column eliminado_admin boolean not null default false;
alter table public.productos
  add constraint productos_eliminado_inactivo check (not eliminado_admin or not activo);
commit;
