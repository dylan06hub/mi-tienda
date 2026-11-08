-- 100 productos ficticios adicionales. Fotos locales por tipo de producto.
-- Solo inserta IDs nuevos: repetir no modifica productos, variantes ni stock existentes.
begin;

create temporary table lote_norte_100 on commit drop as
with categorias(slug,tipo,categoria,imagen,precio,talles,colores) as (values
  ('remera','Remera','Remeras','camiseta',21900,array['XS','S','M','L','XL','XXL'],array['Blanco','Negro']),
  ('buzo','Buzo','Buzos','sudadera',52900,array['S','M','L','XL','XXL'],array['Gris','Negro']),
  ('pantalon','Pantalón','Pantalones','vaqueros',61900,array['38','40','42','44','46'],array['Azul','Negro']),
  ('camisa','Camisa','Camisas','camisa',44900,array['S','M','L','XL'],array['Blanco','Azul']),
  ('chaqueta','Chaqueta','Chaquetas','chaqueta',92900,array['S','M','L','XL'],array['Negro','Gris']),
  ('abrigo','Abrigo','Abrigos','abrigo',119900,array['S','M','L','XL'],array['Camel','Negro']),
  ('mochila','Mochila','Mochilas','bolso',32900,array['Único'],array['Azul','Negro']),
  ('accesorio','Accesorio','Accesorios','gorra',15900,array['Único'],array['Negro','Blanco']),
  ('zapatillas','Zapatillas','Calzado','zapatillas',84900,array['36','37','38','39','40','41','42','43','44'],array['Blanco','Negro']),
  ('vestido','Vestido','Vestidos','vestido',63900,array['XS','S','M','L','XL'],array['Negro','Estampado'])
), modelos(n,slug,nombre) as (values
  (1,'distrito','Distrito'),(2,'asfalto','Asfalto'),(3,'circuito','Circuito'),
  (4,'coordenada','Coordenada'),(5,'anden','Andén'),(6,'esquina','Esquina'),
  (7,'horizonte','Horizonte'),(8,'trama','Trama'),(9,'punto','Punto'),(10,'frecuencia','Frecuencia')
)
select 'demo-norte-100-'||c.slug||'-'||m.slug as id,
  (case when c.slug='accesorio' then case when m.n<=5 then 'Gorra' else 'Lentes' end else c.tipo end)||' '||m.nombre as nombre,
  c.categoria, '/productos/'||(case when c.slug='accesorio' and m.n>5 then 'gafas' else c.imagen end)||'.jpg' as imagen,
  c.precio+(m.n-1)*1700 as precio, c.talles,c.colores,m.n,
  m.n in (1,6) as destacado, m.n in (3,6,9) as oferta
from categorias c cross join modelos m;

with nuevos as (
  insert into public.productos(id,nombre,descripcion,precio,categoria,imagen,activo,destacado,oferta)
  select id,nombre,
    'Producto ficticio para probar la tienda. Fotografía ilustrativa del tipo de producto, compartida entre modelos. Los colores, talles y stock son de demostración.',
    precio,categoria,imagen,true,destacado,oferta
  from lote_norte_100
  on conflict(id) do nothing
  returning id
)
insert into public.variantes(producto_id,id,talle,color,stock)
select l.id,translate(lower(t.talle),'ú','u')||'-'||lower(c.color),t.talle,c.color,
  case when (l.n+t.pos+c.pos)%7=0 then 0 else 3+(l.n*3+t.pos+c.pos)%18 end
from lote_norte_100 l join nuevos n on n.id=l.id
cross join lateral unnest(l.talles) with ordinality as t(talle,pos)
cross join lateral unnest(l.colores) with ordinality as c(color,pos);

do $$
begin
  if (select count(*) from lote_norte_100)<>100 or
     (select count(*) from public.productos p join lote_norte_100 l using(id))<>100 or
     exists(select 1 from lote_norte_100 l where not exists(select 1 from public.variantes v where v.producto_id=l.id)) then
    raise exception 'La carga de 100 productos está incompleta';
  end if;
end $$;
commit;
