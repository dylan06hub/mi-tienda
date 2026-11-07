-- Solo en una base de prueba con schema.sql, checkout.sql y productos.sql.
-- Ejecutar con psql -v ON_ERROR_STOP=1 -f supabase/tests/productos.sql.
-- Los datos, usuarios y objetos de esta prueba se revierten al finalizar.
begin;

do $$
begin
  assert not has_function_privilege('anon',
    'public.guardar_producto(text,boolean,jsonb,jsonb,jsonb)', 'execute');
end;
$$;

insert into auth.users (id) values ('00000000-0000-0000-0000-000000000001');
insert into public.admins (user_id) values ('00000000-0000-0000-0000-000000000001');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);

create function pg_temp.variantes_originales(p_id text) returns jsonb
language sql as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'talle', talle, 'color', color, 'stock', stock
  ) order by id), '[]'::jsonb)
  from public.variantes where producto_id = p_id;
$$;

-- Fuerza un error después de escribir el producto para probar el rollback.
create function pg_temp.fallar_variante() returns trigger language plpgsql as $$
begin
  if new.id = 'error-prueba' then
    raise exception 'ERROR_PRUEBA';
  end if;
  return new;
end;
$$;
create trigger error_prueba before insert or update on public.variantes
for each row execute function pg_temp.fallar_variante();

set local role authenticated;
do $$
declare
  datos jsonb := '{"nombre":"Prueba", "precio":100, "categoria":"Ropa",
    "activo":true, "destacado":false, "oferta":false}';
  variantes jsonb := '[{"id":"s-negro","talle":"S","color":"Negro","stock":10}]';
  originales jsonb;
begin
  perform public.guardar_producto('fase1-prueba', true, datos, variantes, '[]');
  assert (select stock = 10 from public.variantes where producto_id = 'fase1-prueba');
  originales := pg_temp.variantes_originales('fase1-prueba');

  perform public.guardar_producto('fase1-prueba', false,
    datos || '{"nombre":"Editado", "precio":120}', variantes, originales);
  assert (select nombre = 'Editado' and precio = 120
    from public.productos where id = 'fase1-prueba');

  begin
    perform public.guardar_producto('fase1-prueba', false, datos,
      variantes || '[{"id":"error-prueba","talle":"M","color":"Negro","stock":1}]',
      originales);
    assert false, 'Se esperaba un error de escritura';
  exception when raise_exception then
    assert sqlerrm = 'ERROR_PRUEBA', sqlerrm;
  end;
  assert (select nombre = 'Editado' and precio = 120
    from public.productos where id = 'fase1-prueba'), 'El producto debe revertirse';
  assert pg_temp.variantes_originales('fase1-prueba') = originales;

  begin
    perform public.guardar_producto('fase1-nuevo-error', true, datos,
      '[{"id":"error-prueba","talle":"M","color":"Negro","stock":1}]', '[]');
    assert false, 'Se esperaba un error de escritura';
  exception when raise_exception then
    assert sqlerrm = 'ERROR_PRUEBA', sqlerrm;
  end;
  assert not exists (select 1 from public.productos where id = 'fase1-nuevo-error');

  -- Representa el descuento de una venta después de abrir el formulario.
  update public.variantes set stock = 9 where producto_id = 'fase1-prueba';
  begin
    perform public.guardar_producto('fase1-prueba', false, datos, variantes, originales);
    assert false, 'Se esperaba un conflicto de stock';
  exception when raise_exception then
    assert sqlerrm = 'VARIANTES_DESACTUALIZADAS', sqlerrm;
  end;
  assert (select stock = 9 from public.variantes where producto_id = 'fase1-prueba');
  assert (select nombre = 'Editado' from public.productos where id = 'fase1-prueba');

  -- El conflicto también protege variantes que se intentan eliminar.
  begin
    perform public.guardar_producto('fase1-prueba', false, datos,
      '[{"id":"m-blanco","talle":"M","color":"Blanco","stock":2}]', originales);
    assert false, 'Se esperaba un conflicto al quitar una variante';
  exception when raise_exception then
    assert sqlerrm = 'VARIANTES_DESACTUALIZADAS', sqlerrm;
  end;

  originales := pg_temp.variantes_originales('fase1-prueba');
  perform public.guardar_producto('fase1-prueba', false, datos,
    '[{"id":"m-blanco","talle":"M","color":"Blanco","stock":2}]', originales);
  assert not exists (select 1 from public.variantes
    where producto_id = 'fase1-prueba' and id = 's-negro');
  assert (select stock = 2 from public.variantes
    where producto_id = 'fase1-prueba' and id = 'm-blanco');

  begin
    perform public.guardar_producto('fase1-prueba', false, datos,
      '[{"id":"m-blanco","talle":"M","color":"Blanco","stock":2}]', originales);
    assert false, 'Se esperaba un conflicto de identidad de variantes';
  exception when raise_exception then
    assert sqlerrm = 'VARIANTES_DESACTUALIZADAS', sqlerrm;
  end;

  begin
    perform public.guardar_producto('fase1-prueba', false, datos,
      '[{"id":"m-blanco","talle":"S","color":"Negro","stock":2}]',
      pg_temp.variantes_originales('fase1-prueba'));
    assert false, 'No debe reutilizar el id con otro talle/color';
  exception when raise_exception then
    assert sqlerrm = 'VARIANTES_INVALIDAS', sqlerrm;
  end;
end;
$$;
reset role;

insert into public.pedidos (id, total, nombre, email)
values ('00000000-0000-0000-0000-000000000002', 100, 'Prueba', 'prueba@example.com');
insert into public.items_pedido (pedido_id, producto_id, variante_id, cantidad, precio_unitario)
values ('00000000-0000-0000-0000-000000000002', 'fase1-prueba', 'm-blanco', 1, 100);

set local role authenticated;
do $$
begin
  begin
    perform public.guardar_producto('fase1-prueba', false,
      '{"nombre":"No guardar","precio":200,"categoria":"Ropa",
        "activo":true,"destacado":false,"oferta":false}',
      '[{"id":"l-negro","talle":"L","color":"Negro","stock":1}]',
      pg_temp.variantes_originales('fase1-prueba'));
    assert false, 'Se esperaba protección de la variante con pedidos';
  exception when foreign_key_violation or restrict_violation then
    null;
  end;
  assert (select nombre = 'Prueba' and precio = 100
    from public.productos where id = 'fase1-prueba');
  assert (select stock = 2 from public.variantes
    where producto_id = 'fase1-prueba' and id = 'm-blanco');
end;
$$;

-- Un usuario autenticado que no es administrador no puede usar la función.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
do $$
begin
  begin
    perform public.guardar_producto('sin-permiso', true, '{}', '[]', '[]');
    assert false, 'Se esperaba denegar el acceso';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;
reset role;
rollback;
