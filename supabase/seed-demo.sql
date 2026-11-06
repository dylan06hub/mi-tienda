-- Productos de muestra para cargar manualmente en un entorno de prueba.
-- Quedan ocultos en la tienda hasta que un administrador los publique.
-- Es idempotente: se puede ejecutar más de una vez.

begin;

insert into public.productos (
  id, nombre, descripcion, precio, categoria, imagen, activo, destacado, oferta
)
values
  (
    'remera-oversize-demo',
    'Remera Oversize',
    'Remera de algodón pesado con calce amplio y hombros caídos. Un básico cómodo para todos los días.',
    42900,
    'Camisetas',
    null,
    false,
    false,
    false
  ),
  (
    'pantalon-cargo-demo',
    'Pantalón Cargo',
    'Pantalón de gabardina con calce relajado, cintura cómoda y bolsillos laterales.',
    78900,
    'Pantalones',
    null,
    false,
    false,
    false
  ),
  (
    'top-canelado-demo',
    'Top Canelado',
    'Top de tejido acanalado suave, con tirantes anchos y calce cómodo para combinar en capas.',
    35900,
    'Tops',
    null,
    false,
    false,
    false
  )
on conflict (id) do update set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion,
  precio = excluded.precio,
  categoria = excluded.categoria,
  imagen = excluded.imagen,
  activo = false,
  destacado = false,
  oferta = false;

insert into public.variantes (producto_id, id, talle, color, stock)
values
  ('remera-oversize-demo', 's-negro', 'S', 'Negro', 5),
  ('remera-oversize-demo', 'm-negro', 'M', 'Negro', 5),
  ('remera-oversize-demo', 'l-negro', 'L', 'Negro', 5),
  ('remera-oversize-demo', 's-blanco', 'S', 'Blanco', 5),
  ('remera-oversize-demo', 'm-blanco', 'M', 'Blanco', 5),
  ('remera-oversize-demo', 'l-blanco', 'L', 'Blanco', 5),
  ('pantalon-cargo-demo', '38-verde-oliva', '38', 'Verde oliva', 3),
  ('pantalon-cargo-demo', '40-verde-oliva', '40', 'Verde oliva', 5),
  ('pantalon-cargo-demo', '42-verde-oliva', '42', 'Verde oliva', 3),
  ('pantalon-cargo-demo', '38-negro', '38', 'Negro', 3),
  ('pantalon-cargo-demo', '40-negro', '40', 'Negro', 5),
  ('pantalon-cargo-demo', '42-negro', '42', 'Negro', 3),
  ('top-canelado-demo', 's-arena', 'S', 'Arena', 4),
  ('top-canelado-demo', 'm-arena', 'M', 'Arena', 6),
  ('top-canelado-demo', 'l-arena', 'L', 'Arena', 4),
  ('top-canelado-demo', 's-negro', 'S', 'Negro', 4),
  ('top-canelado-demo', 'm-negro', 'M', 'Negro', 6),
  ('top-canelado-demo', 'l-negro', 'L', 'Negro', 4)
on conflict (producto_id, id) do update set
  talle = excluded.talle,
  color = excluded.color,
  stock = excluded.stock;

commit;
