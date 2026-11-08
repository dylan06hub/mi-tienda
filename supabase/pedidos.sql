-- Quitar pedidos del panel sin destruir pagos, reservas ni historial.
alter table public.pedidos
  add column if not exists eliminado_admin boolean not null default false;
