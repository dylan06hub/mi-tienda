-- Esta prueba corre en la base temporal del verificador, nunca en producción.
\ir ../seed-100-productos.sql

do $$
begin
  if (select count(*) from public.productos where id like 'demo-norte-100-%' and activo and not eliminado_admin)<>100 then
    raise exception 'Deben publicarse exactamente 100 productos nuevos';
  end if;
  if (select count(distinct categoria) from public.productos where id like 'demo-norte-100-%')<>10 then
    raise exception 'Deben existir diez categorías';
  end if;
  if (select count(*) from public.productos where id like 'demo-norte-100-%' and destacado)<>20 or
     (select count(*) from public.productos where id like 'demo-norte-100-%' and oferta)<>30 then
    raise exception 'Faltan imprescindibles u ofertas';
  end if;
  if (select count(*) from public.variantes where producto_id like 'demo-norte-100-%')<>880 then
    raise exception 'Faltan variantes de talles y colores';
  end if;
  if exists(select 1 from public.productos p where p.id like 'demo-norte-100-%' and
    (p.imagen is null or p.imagen not like '/productos/%.jpg' or not exists(select 1 from public.variantes v where v.producto_id=p.id and v.stock>0))) then
    raise exception 'Todos deben tener imagen y alguna variante disponible';
  end if;
end $$;

update public.productos set precio=123,activo=false,eliminado_admin=true where id='demo-norte-100-remera-distrito';
update public.variantes set stock=1 where producto_id='demo-norte-100-remera-distrito';
delete from public.variantes where producto_id='demo-norte-100-remera-distrito' and id='xs-blanco';
\ir ../seed-100-productos.sql

do $$
begin
  if not exists(select 1 from public.productos where id='demo-norte-100-remera-distrito' and precio=123 and eliminado_admin and not activo) or
     exists(select 1 from public.variantes where producto_id='demo-norte-100-remera-distrito' and (stock<>1 or id='xs-blanco')) then
    raise exception 'Repetir la carga no debe revivir productos ni alterar ediciones o stock';
  end if;
end $$;
