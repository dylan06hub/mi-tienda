-- Catálogo inicial de "norte." con los mismos ids, precios y stock de
-- lib/productos.ts. Es idempotente: se puede ejecutar más de una vez.

begin;

insert into public.productos (id, nombre, descripcion, precio, categoria, imagen)
values
  (
    'camiseta-esencial',
    'Camiseta Esencial',
    'Camiseta de algodón orgánico de 220 g/m² con cuello redondo y corte recto. Suave, resistente y pensada para usarse hasta gastarse.',
    29900,
    'Camisetas',
    '/productos/camiseta.jpg'
  ),
  (
    'camisa-lino',
    'Camisa de Lino',
    'Camisa de lino lavado de caída ligera, con bolsillo pecho y botones de corozo. Fresca en verano y perfecta como capa en invierno.',
    59900,
    'Camisas',
    '/productos/camisa.jpg'
  ),
  (
    'buzo-norte',
    'Buzo Norte',
    'Buzo de felpa peinada con capucha forrada y puños elásticos. Un clásico de entretiempo con la medida justa.',
    69900,
    'Buzos',
    '/productos/sudadera.jpg'
  ),
  (
    'chaqueta-cuero',
    'Chaqueta de Cuero',
    'Chaqueta de piel vacuno con acabado mate, forro interior y cremallera lateral. Envejece bien y mejora con el uso.',
    149900,
    'Chaquetas',
    '/productos/chaqueta.jpg'
  ),
  (
    'vaqueros-straight',
    'Vaqueros Straight',
    'Vaquero de denim rígido con tiro alto y pernera recta. Sin elásticos ni artificios: el jean de siempre, bien hecho.',
    79900,
    'Pantalones',
    '/productos/vaqueros.jpg'
  ),
  (
    'vestido-midi',
    'Vestido Midi',
    'Vestido midi de viscosa fluida con manga corta y cintura marcada. Cómodo de día, elegante de noche.',
    89900,
    'Vestidos',
    '/productos/vestido.jpg'
  ),
  (
    'abrigo-largo',
    'Abrigo Largo',
    'Abrigo de lana mezclada con solapa cruzada y bolsillos interiores. Abriga de verdad y combina con todo.',
    139900,
    'Abrigos',
    '/productos/abrigo.jpg'
  ),
  (
    'falda-plisada',
    'Falda Plisada',
    'Falda de tablas con caída fluida y cintura elástica. Se mueve bien y no se pega.',
    49900,
    'Faldas',
    '/productos/falda.jpg'
  ),
  (
    'gorra-clasica',
    'Gorra Clásica',
    'Gorra de sarga de algodón con visera curva y cierre ajustable. Ligera, lavable y sin logos gritones.',
    24900,
    'Accesorios',
    '/productos/gorra.jpg'
  ),
  (
    'gafas-sol',
    'Gafas de Sol',
    'Gafas de acetato con lentes polarizadas y protección UV400. Montura de cuidado, estuche incluido.',
    39900,
    'Accesorios',
    '/productos/gafas.jpg'
  ),
  (
    'bolso-tote',
    'Bolso Tote',
    'Bolso tote de lona encerada con asas reforzadas y bolsillo interior. Cabe la vida entera.',
    54900,
    'Accesorios',
    '/productos/bolso.jpg'
  ),
  (
    'zapatillas-runner',
    'Zapatillas Runner',
    'Zapatilla de piel y malla con suela de goma natural. Diseñada para caminar mucho sin pensarlo.',
    99900,
    'Calzado',
    '/productos/zapatillas.jpg'
  )
on conflict (id) do update set
  nombre = excluded.nombre,
  descripcion = excluded.descripcion,
  precio = excluded.precio,
  categoria = excluded.categoria,
  imagen = excluded.imagen;

insert into public.variantes (producto_id, id, talle, color, stock)
values
  -- Camiseta Esencial
  ('camiseta-esencial', 'xs-negro', 'XS', 'Negro', 12),
  ('camiseta-esencial', 's-negro', 'S', 'Negro', 8),
  ('camiseta-esencial', 'm-negro', 'M', 'Negro', 10),
  ('camiseta-esencial', 'l-negro', 'L', 'Negro', 6),
  ('camiseta-esencial', 'xl-negro', 'XL', 'Negro', 0),
  ('camiseta-esencial', 'xs-blanco', 'XS', 'Blanco', 12),
  ('camiseta-esencial', 's-blanco', 'S', 'Blanco', 8),
  ('camiseta-esencial', 'm-blanco', 'M', 'Blanco', 10),
  ('camiseta-esencial', 'l-blanco', 'L', 'Blanco', 6),
  ('camiseta-esencial', 'xl-blanco', 'XL', 'Blanco', 0),
  ('camiseta-esencial', 'xs-verde-oliva', 'XS', 'Verde oliva', 12),
  ('camiseta-esencial', 's-verde-oliva', 'S', 'Verde oliva', 8),
  ('camiseta-esencial', 'm-verde-oliva', 'M', 'Verde oliva', 10),
  ('camiseta-esencial', 'l-verde-oliva', 'L', 'Verde oliva', 6),
  ('camiseta-esencial', 'xl-verde-oliva', 'XL', 'Verde oliva', 0),

  -- Camisa de Lino
  ('camisa-lino', 's-arena', 'S', 'Arena', 5),
  ('camisa-lino', 'm-arena', 'M', 'Arena', 7),
  ('camisa-lino', 'l-arena', 'L', 'Arena', 4),
  ('camisa-lino', 's-blanco', 'S', 'Blanco', 5),
  ('camisa-lino', 'm-blanco', 'M', 'Blanco', 7),
  ('camisa-lino', 'l-blanco', 'L', 'Blanco', 4),

  -- Buzo Norte
  ('buzo-norte', 's-gris-marengo', 'S', 'Gris marengo', 6),
  ('buzo-norte', 'm-gris-marengo', 'M', 'Gris marengo', 9),
  ('buzo-norte', 'l-gris-marengo', 'L', 'Gris marengo', 5),
  ('buzo-norte', 'xl-gris-marengo', 'XL', 'Gris marengo', 2),
  ('buzo-norte', 's-negro', 'S', 'Negro', 6),
  ('buzo-norte', 'm-negro', 'M', 'Negro', 9),
  ('buzo-norte', 'l-negro', 'L', 'Negro', 5),
  ('buzo-norte', 'xl-negro', 'XL', 'Negro', 2),

  -- Chaqueta de Cuero
  ('chaqueta-cuero', 's-marron', 'S', 'Marrón', 3),
  ('chaqueta-cuero', 'm-marron', 'M', 'Marrón', 4),
  ('chaqueta-cuero', 'l-marron', 'L', 'Marrón', 2),
  ('chaqueta-cuero', 's-negro', 'S', 'Negro', 3),
  ('chaqueta-cuero', 'm-negro', 'M', 'Negro', 4),
  ('chaqueta-cuero', 'l-negro', 'L', 'Negro', 2),

  -- Vaqueros Straight
  ('vaqueros-straight', '36-azul', '36', 'Azul', 4),
  ('vaqueros-straight', '38-azul', '38', 'Azul', 6),
  ('vaqueros-straight', '40-azul', '40', 'Azul', 5),
  ('vaqueros-straight', '42-azul', '42', 'Azul', 2),
  ('vaqueros-straight', '36-negro', '36', 'Negro', 4),
  ('vaqueros-straight', '38-negro', '38', 'Negro', 6),
  ('vaqueros-straight', '40-negro', '40', 'Negro', 5),
  ('vaqueros-straight', '42-negro', '42', 'Negro', 2),

  -- Vestido Midi
  ('vestido-midi', 'xs-verde-oliva', 'XS', 'Verde oliva', 3),
  ('vestido-midi', 's-verde-oliva', 'S', 'Verde oliva', 5),
  ('vestido-midi', 'm-verde-oliva', 'M', 'Verde oliva', 4),
  ('vestido-midi', 'l-verde-oliva', 'L', 'Verde oliva', 2),
  ('vestido-midi', 'xs-negro', 'XS', 'Negro', 3),
  ('vestido-midi', 's-negro', 'S', 'Negro', 5),
  ('vestido-midi', 'm-negro', 'M', 'Negro', 4),
  ('vestido-midi', 'l-negro', 'L', 'Negro', 2),

  -- Abrigo Largo
  ('abrigo-largo', 's-camel', 'S', 'Camel', 2),
  ('abrigo-largo', 'm-camel', 'M', 'Camel', 3),
  ('abrigo-largo', 'l-camel', 'L', 'Camel', 2),
  ('abrigo-largo', 's-gris', 'S', 'Gris', 2),
  ('abrigo-largo', 'm-gris', 'M', 'Gris', 3),
  ('abrigo-largo', 'l-gris', 'L', 'Gris', 2),

  -- Falda Plisada
  ('falda-plisada', 'xs-negro', 'XS', 'Negro', 4),
  ('falda-plisada', 's-negro', 'S', 'Negro', 6),
  ('falda-plisada', 'm-negro', 'M', 'Negro', 3),
  ('falda-plisada', 'xs-arena', 'XS', 'Arena', 4),
  ('falda-plisada', 's-arena', 'S', 'Arena', 6),
  ('falda-plisada', 'm-arena', 'M', 'Arena', 3),

  -- Gorra Clásica
  ('gorra-clasica', 'unica-negro', 'Única', 'Negro', 15),
  ('gorra-clasica', 'unica-arena', 'Única', 'Arena', 15),

  -- Gafas de Sol
  ('gafas-sol', 'unica-carey', 'Única', 'Carey', 9),
  ('gafas-sol', 'unica-negro', 'Única', 'Negro', 9),

  -- Bolso Tote
  ('bolso-tote', 'unica-cuero', 'Única', 'Cuero', 7),
  ('bolso-tote', 'unica-negro', 'Única', 'Negro', 7),

  -- Zapatillas Runner
  ('zapatillas-runner', '39-blanco', '39', 'Blanco', 4),
  ('zapatillas-runner', '40-blanco', '40', 'Blanco', 6),
  ('zapatillas-runner', '41-blanco', '41', 'Blanco', 5),
  ('zapatillas-runner', '42-blanco', '42', 'Blanco', 3),
  ('zapatillas-runner', '43-blanco', '43', 'Blanco', 0),
  ('zapatillas-runner', '39-negro', '39', 'Negro', 4),
  ('zapatillas-runner', '40-negro', '40', 'Negro', 6),
  ('zapatillas-runner', '41-negro', '41', 'Negro', 5),
  ('zapatillas-runner', '42-negro', '42', 'Negro', 3),
  ('zapatillas-runner', '43-negro', '43', 'Negro', 0)
on conflict (producto_id, id) do update set
  talle = excluded.talle,
  color = excluded.color,
  stock = excluded.stock;

commit;
