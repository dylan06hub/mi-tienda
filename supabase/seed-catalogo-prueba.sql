-- Catálogo ficticio: 30 productos publicados, con imágenes locales ilustrativas.
-- Ejecutar en el proyecto de prueba después de schema.sql y sections.sql.
-- Repetir la carga no duplica filas ni sobrescribe precios, ediciones o stock vendido.
-- Oculta únicamente los tres registros de prueba previos, sin borrar su historial.
begin;

insert into public.productos
  (id, nombre, descripcion, precio, categoria, imagen, activo, destacado, oferta)
values
  ('demo-norte-remera-esencial', 'Remera Esencial', 'Remera de uso diario con cuello redondo y calce cómodo. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 24900, 'Remeras', '/productos/camiseta.jpg', true, true, false),
  ('demo-norte-remera-relax', 'Remera Relax', 'Remera de uso diario con cuello redondo y calce cómodo. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 28900, 'Remeras', '/productos/camiseta.jpg', true, false, false),
  ('demo-norte-remera-urbana', 'Remera Urbana', 'Remera de uso diario con cuello redondo y calce cómodo. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 31900, 'Remeras', '/productos/camiseta.jpg', true, false, false),
  ('demo-norte-camisa-de-lino', 'Camisa de Lino', 'Camisa de manga larga para combinar con jeans o pantalones de vestir. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 54900, 'Camisas', '/productos/camisa.jpg', true, true, false),
  ('demo-norte-camisa-casual', 'Camisa Casual', 'Camisa de manga larga para combinar con jeans o pantalones de vestir. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 48900, 'Camisas', '/productos/camisa.jpg', true, false, false),
  ('demo-norte-camisa-de-entretiempo', 'Camisa de Entretiempo', 'Camisa de manga larga para combinar con jeans o pantalones de vestir. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 59900, 'Camisas', '/productos/camisa.jpg', true, false, false),
  ('demo-norte-buzo-norte', 'Buzo Norte', 'Buzo de calce relajado para sumar una capa de abrigo a tus conjuntos. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 62900, 'Buzos', '/productos/sudadera.jpg', true, true, false),
  ('demo-norte-buzo-relax', 'Buzo Relax', 'Buzo de calce relajado para sumar una capa de abrigo a tus conjuntos. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 65900, 'Buzos', '/productos/sudadera.jpg', true, false, false),
  ('demo-norte-buzo-de-entretiempo', 'Buzo de Entretiempo', 'Buzo de calce relajado para sumar una capa de abrigo a tus conjuntos. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 58900, 'Buzos', '/productos/sudadera.jpg', true, false, false),
  ('demo-norte-chaqueta-urbana', 'Chaqueta Urbana', 'Chaqueta de manga larga con cierre frontal y bolsillos para el día a día. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 119900, 'Chaquetas', '/productos/chaqueta.jpg', true, false, false),
  ('demo-norte-chaqueta-clasica', 'Chaqueta Clásica', 'Chaqueta de manga larga con cierre frontal y bolsillos para el día a día. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 129900, 'Chaquetas', '/productos/chaqueta.jpg', true, false, false),
  ('demo-norte-chaqueta-de-media-estacion', 'Chaqueta de Media Estación', 'Chaqueta de manga larga con cierre frontal y bolsillos para el día a día. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 109900, 'Chaquetas', '/productos/chaqueta.jpg', true, false, false),
  ('demo-norte-jean-recto', 'Jean Recto', 'Jean de tiro medio y corte recto, fácil de combinar con prendas básicas. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 74900, 'Pantalones', '/productos/vaqueros.jpg', true, true, false),
  ('demo-norte-jean-casual', 'Jean Casual', 'Jean de tiro medio y corte recto, fácil de combinar con prendas básicas. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 69900, 'Pantalones', '/productos/vaqueros.jpg', true, false, false),
  ('demo-norte-jean-de-todos-los-dias', 'Jean de Todos los Días', 'Jean de tiro medio y corte recto, fácil de combinar con prendas básicas. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 79900, 'Pantalones', '/productos/vaqueros.jpg', true, false, false),
  ('demo-norte-vestido-midi', 'Vestido Midi', 'Vestido de largo medio y calce cómodo para acompañarte durante el día. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 84900, 'Vestidos', '/productos/vestido.jpg', true, true, false),
  ('demo-norte-vestido-de-dia', 'Vestido de Día', 'Vestido de largo medio y calce cómodo para acompañarte durante el día. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 79900, 'Vestidos', '/productos/vestido.jpg', true, false, false),
  ('demo-norte-vestido-casual', 'Vestido Casual', 'Vestido de largo medio y calce cómodo para acompañarte durante el día. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 89900, 'Vestidos', '/productos/vestido.jpg', true, false, false),
  ('demo-norte-abrigo-largo', 'Abrigo Largo', 'Abrigo largo con solapa y bolsillos, pensado para llevar sobre otras prendas. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 139900, 'Abrigos', '/productos/abrigo.jpg', true, true, false),
  ('demo-norte-abrigo-clasico', 'Abrigo Clásico', 'Abrigo largo con solapa y bolsillos, pensado para llevar sobre otras prendas. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 149900, 'Abrigos', '/productos/abrigo.jpg', true, false, false),
  ('demo-norte-abrigo-de-invierno', 'Abrigo de Invierno', 'Abrigo largo con solapa y bolsillos, pensado para llevar sobre otras prendas. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 159900, 'Abrigos', '/productos/abrigo.jpg', true, false, false),
  ('demo-norte-falda-plisada', 'Falda Plisada', 'Falda de largo medio y caída ligera para combinar con remeras o camisas. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 49900, 'Faldas', '/productos/falda.jpg', true, false, false),
  ('demo-norte-falda-midi', 'Falda Midi', 'Falda de largo medio y caída ligera para combinar con remeras o camisas. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 52900, 'Faldas', '/productos/falda.jpg', true, false, false),
  ('demo-norte-falda-de-dia', 'Falda de Día', 'Falda de largo medio y caída ligera para combinar con remeras o camisas. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 45900, 'Faldas', '/productos/falda.jpg', true, false, false),
  ('demo-norte-gorra-clasica', 'Gorra Clásica', 'Gorra con visera curva y ajuste trasero. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 19900, 'Accesorios', '/productos/gorra.jpg', true, true, false),
  ('demo-norte-lentes-de-sol', 'Lentes de Sol', 'Lentes de sol con montura de estilo clásico. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 34900, 'Accesorios', '/productos/gafas.jpg', true, false, false),
  ('demo-norte-mochila-urbana', 'Mochila Urbana', 'Mochila con cierre y asas para llevar tus objetos de todos los días. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 54900, 'Accesorios', '/productos/bolso.jpg', true, false, false),
  ('demo-norte-zapatillas-urbanas', 'Zapatillas Urbanas', 'Zapatillas de perfil urbano con cordones y suela de goma para uso diario. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 89900, 'Calzado', '/productos/zapatillas.jpg', true, true, false),
  ('demo-norte-zapatillas-de-diario', 'Zapatillas de Diario', 'Zapatillas de perfil urbano con cordones y suela de goma para uso diario. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 94900, 'Calzado', '/productos/zapatillas.jpg', true, false, false),
  ('demo-norte-zapatillas-casual', 'Zapatillas Casual', 'Zapatillas de perfil urbano con cordones y suela de goma para uso diario. Producto ficticio de prueba. La fotografía es ilustrativa y puede repetirse en otros modelos.', 99900, 'Calzado', '/productos/zapatillas.jpg', true, false, false)
on conflict (id) do nothing;

insert into public.variantes (producto_id, id, talle, color, stock)
values
  ('demo-norte-remera-esencial', 's-blanco', 'S', 'Blanco', 6),
  ('demo-norte-remera-esencial', 'm-blanco', 'M', 'Blanco', 10),
  ('demo-norte-remera-esencial', 'l-blanco', 'L', 'Blanco', 8),
  ('demo-norte-remera-esencial', 'xl-blanco', 'XL', 'Blanco', 3),
  ('demo-norte-remera-relax', 's-blanco', 'S', 'Blanco', 6),
  ('demo-norte-remera-relax', 'm-blanco', 'M', 'Blanco', 10),
  ('demo-norte-remera-relax', 'l-blanco', 'L', 'Blanco', 8),
  ('demo-norte-remera-relax', 'xl-blanco', 'XL', 'Blanco', 3),
  ('demo-norte-remera-urbana', 's-blanco', 'S', 'Blanco', 6),
  ('demo-norte-remera-urbana', 'm-blanco', 'M', 'Blanco', 10),
  ('demo-norte-remera-urbana', 'l-blanco', 'L', 'Blanco', 8),
  ('demo-norte-remera-urbana', 'xl-blanco', 'XL', 'Blanco', 3),
  ('demo-norte-camisa-de-lino', 's-azul', 'S', 'Azul', 6),
  ('demo-norte-camisa-de-lino', 'm-azul', 'M', 'Azul', 10),
  ('demo-norte-camisa-de-lino', 'l-azul', 'L', 'Azul', 8),
  ('demo-norte-camisa-de-lino', 'xl-azul', 'XL', 'Azul', 3),
  ('demo-norte-camisa-casual', 's-azul', 'S', 'Azul', 6),
  ('demo-norte-camisa-casual', 'm-azul', 'M', 'Azul', 10),
  ('demo-norte-camisa-casual', 'l-azul', 'L', 'Azul', 8),
  ('demo-norte-camisa-casual', 'xl-azul', 'XL', 'Azul', 3),
  ('demo-norte-camisa-de-entretiempo', 's-azul', 'S', 'Azul', 6),
  ('demo-norte-camisa-de-entretiempo', 'm-azul', 'M', 'Azul', 10),
  ('demo-norte-camisa-de-entretiempo', 'l-azul', 'L', 'Azul', 8),
  ('demo-norte-camisa-de-entretiempo', 'xl-azul', 'XL', 'Azul', 3),
  ('demo-norte-buzo-norte', 's-gris', 'S', 'Gris', 6),
  ('demo-norte-buzo-norte', 'm-gris', 'M', 'Gris', 10),
  ('demo-norte-buzo-norte', 'l-gris', 'L', 'Gris', 8),
  ('demo-norte-buzo-norte', 'xl-gris', 'XL', 'Gris', 3),
  ('demo-norte-buzo-relax', 's-gris', 'S', 'Gris', 6),
  ('demo-norte-buzo-relax', 'm-gris', 'M', 'Gris', 10),
  ('demo-norte-buzo-relax', 'l-gris', 'L', 'Gris', 8),
  ('demo-norte-buzo-relax', 'xl-gris', 'XL', 'Gris', 3),
  ('demo-norte-buzo-de-entretiempo', 's-gris', 'S', 'Gris', 6),
  ('demo-norte-buzo-de-entretiempo', 'm-gris', 'M', 'Gris', 10),
  ('demo-norte-buzo-de-entretiempo', 'l-gris', 'L', 'Gris', 8),
  ('demo-norte-buzo-de-entretiempo', 'xl-gris', 'XL', 'Gris', 3),
  ('demo-norte-chaqueta-urbana', 's-negro', 'S', 'Negro', 6),
  ('demo-norte-chaqueta-urbana', 'm-negro', 'M', 'Negro', 10),
  ('demo-norte-chaqueta-urbana', 'l-negro', 'L', 'Negro', 8),
  ('demo-norte-chaqueta-urbana', 'xl-negro', 'XL', 'Negro', 3),
  ('demo-norte-chaqueta-clasica', 's-negro', 'S', 'Negro', 6),
  ('demo-norte-chaqueta-clasica', 'm-negro', 'M', 'Negro', 10),
  ('demo-norte-chaqueta-clasica', 'l-negro', 'L', 'Negro', 8),
  ('demo-norte-chaqueta-clasica', 'xl-negro', 'XL', 'Negro', 3),
  ('demo-norte-chaqueta-de-media-estacion', 's-negro', 'S', 'Negro', 6),
  ('demo-norte-chaqueta-de-media-estacion', 'm-negro', 'M', 'Negro', 10),
  ('demo-norte-chaqueta-de-media-estacion', 'l-negro', 'L', 'Negro', 8),
  ('demo-norte-chaqueta-de-media-estacion', 'xl-negro', 'XL', 'Negro', 3),
  ('demo-norte-jean-recto', '36-azul', '36', 'Azul', 6),
  ('demo-norte-jean-recto', '38-azul', '38', 'Azul', 10),
  ('demo-norte-jean-recto', '40-azul', '40', 'Azul', 8),
  ('demo-norte-jean-recto', '42-azul', '42', 'Azul', 3),
  ('demo-norte-jean-recto', '44-azul', '44', 'Azul', 4),
  ('demo-norte-jean-casual', '36-azul', '36', 'Azul', 6),
  ('demo-norte-jean-casual', '38-azul', '38', 'Azul', 10),
  ('demo-norte-jean-casual', '40-azul', '40', 'Azul', 8),
  ('demo-norte-jean-casual', '42-azul', '42', 'Azul', 3),
  ('demo-norte-jean-casual', '44-azul', '44', 'Azul', 4),
  ('demo-norte-jean-de-todos-los-dias', '36-azul', '36', 'Azul', 6),
  ('demo-norte-jean-de-todos-los-dias', '38-azul', '38', 'Azul', 10),
  ('demo-norte-jean-de-todos-los-dias', '40-azul', '40', 'Azul', 8),
  ('demo-norte-jean-de-todos-los-dias', '42-azul', '42', 'Azul', 3),
  ('demo-norte-jean-de-todos-los-dias', '44-azul', '44', 'Azul', 4),
  ('demo-norte-vestido-midi', 's-estampado', 'S', 'Estampado', 6),
  ('demo-norte-vestido-midi', 'm-estampado', 'M', 'Estampado', 10),
  ('demo-norte-vestido-midi', 'l-estampado', 'L', 'Estampado', 8),
  ('demo-norte-vestido-midi', 'xl-estampado', 'XL', 'Estampado', 3),
  ('demo-norte-vestido-de-dia', 's-estampado', 'S', 'Estampado', 6),
  ('demo-norte-vestido-de-dia', 'm-estampado', 'M', 'Estampado', 10),
  ('demo-norte-vestido-de-dia', 'l-estampado', 'L', 'Estampado', 8),
  ('demo-norte-vestido-de-dia', 'xl-estampado', 'XL', 'Estampado', 3),
  ('demo-norte-vestido-casual', 's-estampado', 'S', 'Estampado', 6),
  ('demo-norte-vestido-casual', 'm-estampado', 'M', 'Estampado', 10),
  ('demo-norte-vestido-casual', 'l-estampado', 'L', 'Estampado', 8),
  ('demo-norte-vestido-casual', 'xl-estampado', 'XL', 'Estampado', 3),
  ('demo-norte-abrigo-largo', 's-camel', 'S', 'Camel', 6),
  ('demo-norte-abrigo-largo', 'm-camel', 'M', 'Camel', 10),
  ('demo-norte-abrigo-largo', 'l-camel', 'L', 'Camel', 8),
  ('demo-norte-abrigo-largo', 'xl-camel', 'XL', 'Camel', 3),
  ('demo-norte-abrigo-clasico', 's-camel', 'S', 'Camel', 6),
  ('demo-norte-abrigo-clasico', 'm-camel', 'M', 'Camel', 10),
  ('demo-norte-abrigo-clasico', 'l-camel', 'L', 'Camel', 8),
  ('demo-norte-abrigo-clasico', 'xl-camel', 'XL', 'Camel', 3),
  ('demo-norte-abrigo-de-invierno', 's-camel', 'S', 'Camel', 6),
  ('demo-norte-abrigo-de-invierno', 'm-camel', 'M', 'Camel', 10),
  ('demo-norte-abrigo-de-invierno', 'l-camel', 'L', 'Camel', 8),
  ('demo-norte-abrigo-de-invierno', 'xl-camel', 'XL', 'Camel', 3),
  ('demo-norte-falda-plisada', 's-negro', 'S', 'Negro', 6),
  ('demo-norte-falda-plisada', 'm-negro', 'M', 'Negro', 10),
  ('demo-norte-falda-plisada', 'l-negro', 'L', 'Negro', 8),
  ('demo-norte-falda-plisada', 'xl-negro', 'XL', 'Negro', 3),
  ('demo-norte-falda-midi', 's-negro', 'S', 'Negro', 6),
  ('demo-norte-falda-midi', 'm-negro', 'M', 'Negro', 10),
  ('demo-norte-falda-midi', 'l-negro', 'L', 'Negro', 8),
  ('demo-norte-falda-midi', 'xl-negro', 'XL', 'Negro', 3),
  ('demo-norte-falda-de-dia', 's-negro', 'S', 'Negro', 6),
  ('demo-norte-falda-de-dia', 'm-negro', 'M', 'Negro', 10),
  ('demo-norte-falda-de-dia', 'l-negro', 'L', 'Negro', 8),
  ('demo-norte-falda-de-dia', 'xl-negro', 'XL', 'Negro', 3),
  ('demo-norte-gorra-clasica', 'unico-negro', 'Único', 'Negro', 6),
  ('demo-norte-lentes-de-sol', 'unico-negro', 'Único', 'Negro', 6),
  ('demo-norte-mochila-urbana', 'unico-azul', 'Único', 'Azul', 6),
  ('demo-norte-zapatillas-urbanas', '38-blanco', '38', 'Blanco', 6),
  ('demo-norte-zapatillas-urbanas', '39-blanco', '39', 'Blanco', 10),
  ('demo-norte-zapatillas-urbanas', '40-blanco', '40', 'Blanco', 8),
  ('demo-norte-zapatillas-urbanas', '41-blanco', '41', 'Blanco', 3),
  ('demo-norte-zapatillas-urbanas', '42-blanco', '42', 'Blanco', 4),
  ('demo-norte-zapatillas-urbanas', '43-blanco', '43', 'Blanco', 2),
  ('demo-norte-zapatillas-de-diario', '38-blanco', '38', 'Blanco', 6),
  ('demo-norte-zapatillas-de-diario', '39-blanco', '39', 'Blanco', 10),
  ('demo-norte-zapatillas-de-diario', '40-blanco', '40', 'Blanco', 8),
  ('demo-norte-zapatillas-de-diario', '41-blanco', '41', 'Blanco', 3),
  ('demo-norte-zapatillas-de-diario', '42-blanco', '42', 'Blanco', 4),
  ('demo-norte-zapatillas-de-diario', '43-blanco', '43', 'Blanco', 2),
  ('demo-norte-zapatillas-casual', '38-blanco', '38', 'Blanco', 6),
  ('demo-norte-zapatillas-casual', '39-blanco', '39', 'Blanco', 10),
  ('demo-norte-zapatillas-casual', '40-blanco', '40', 'Blanco', 8),
  ('demo-norte-zapatillas-casual', '41-blanco', '41', 'Blanco', 3),
  ('demo-norte-zapatillas-casual', '42-blanco', '42', 'Blanco', 4),
  ('demo-norte-zapatillas-casual', '43-blanco', '43', 'Blanco', 2)
on conflict (producto_id, id) do nothing;

update public.productos set activo = false
where (id, nombre) in (
  ('remera-blanca-dc', 'remera blanca dc'),
  ('remera-dc-azul', 'remera dc azul'),
  ('wdqwdf', 'wdqwdf')
);

-- La carga completa debe ser atómica: cualquier comprobación fallida revierte todo.
do $$
begin
  if (select count(*) from public.productos where starts_with(id, 'demo-norte-')) <> 30
    or exists (
      select 1 from public.productos p
      where starts_with(p.id, 'demo-norte-')
        and (p.imagen is null or p.precio <= 0 or not exists (
          select 1 from public.variantes v where v.producto_id = p.id
        ))
    ) then
    raise exception 'CATALOGO_PRUEBA_INCOMPLETO';
  end if;
end;
$$;

commit;
