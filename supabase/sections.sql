-- Secciones de portada: "Los imprescindibles" (destacado) y "Ofertas" (oferta).
-- Idempotente: se puede ejecutar más de una vez.

begin;

alter table public.productos
  add column if not exists destacado boolean not null default false,
  add column if not exists oferta boolean not null default false;

-- Conserva los cuatro productos que la portada destacaba con ids fijos.
update public.productos
set destacado = true
where id in (
  'camiseta-esencial',
  'camisa-lino',
  'buzo-norte',
  'chaqueta-cuero'
);

commit;
