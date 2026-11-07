-- Base de prueba con schema.sql, checkout.sql y reservas.sql. No usar en producción.
begin;
insert into public.productos(id,nombre,precio,categoria) values ('prueba-reservas','Prueba',100,'Prueba');
insert into public.variantes(producto_id,id,talle,color,stock) values ('prueba-reservas','s','S','Negro',2);

do $$
declare
  pedido jsonb;
  otro jsonb;
  v_pedido_id uuid;
  legado uuid;
  items jsonb := '[{"producto_id":"prueba-reservas","variante_id":"s","cantidad":2}]';
  uno jsonb := '[{"producto_id":"prueba-reservas","variante_id":"s","cantidad":1}]';
begin
  assert not has_function_privilege('anon','public.crear_pedido(jsonb,text,text,text,text,numeric,numeric)','execute');
  assert not has_function_privilege('authenticated','public.confirmar_pago_pedido(uuid,text)','execute');
  assert not has_function_privilege('anon','public.liberar_reservas_vencidas()','execute');

  pedido := public.crear_pedido(items,'Prueba','prueba@example.com','123','Dirección',80000,4995);
  v_pedido_id := (pedido->>'pedido_id')::uuid;
  assert (pedido->>'token_comprobante')::uuid is not null;
  assert (pedido->>'reserva_hasta')::timestamptz > now();
  assert (select stock = 0 from public.variantes where producto_id='prueba-reservas');
  begin
    perform public.crear_pedido(uno,'Otro','otro@example.com','123','Dirección',80000,4995);
    assert false, 'No se debe reservar dos veces la última unidad';
  exception when raise_exception then
    assert sqlerrm = 'STOCK_INSUFICIENTE', sqlerrm;
  end;
  assert public.confirmar_pago_pedido(v_pedido_id,'pago-reserva')->>'estado' = 'pagado';
  assert public.confirmar_pago_pedido(v_pedido_id,'pago-reserva')->>'estado' = 'ya_pagado';
  assert public.confirmar_pago_pedido(v_pedido_id,'pago-segundo')->>'estado' = 'pago_duplicado';
  assert (select stock = 0 from public.variantes where producto_id='prueba-reservas');
  assert (public.cambiar_estado_pedido(v_pedido_id,'cancelado')->>'stock_devuelto')::boolean;
  assert exists(select 1 from public.incidencias_pago where mp_payment_id='pago-reserva' and motivo='pedido_cancelado_revisar_reembolso');
  assert not (public.cambiar_estado_pedido(v_pedido_id,'cancelado')->>'stock_devuelto')::boolean;
  assert public.confirmar_pago_pedido(v_pedido_id,'pago-reserva')->>'estado' = 'ya_pagado';
  assert (select stock = 2 from public.variantes where producto_id='prueba-reservas');

  pedido := public.crear_pedido(uno,'Prueba','prueba@example.com','123','Dirección',80000,4995);
  v_pedido_id := (pedido->>'pedido_id')::uuid;
  assert (public.cambiar_estado_pedido(v_pedido_id,'cancelado')->>'stock_devuelto')::boolean;
  assert not (public.cambiar_estado_pedido(v_pedido_id,'cancelado')->>'stock_devuelto')::boolean;
  assert (select stock = 2 from public.variantes where producto_id='prueba-reservas');

  pedido := public.crear_pedido(uno,'Prueba','prueba@example.com','123','Dirección',80000,4995);
  v_pedido_id := (pedido->>'pedido_id')::uuid;
  update public.pedidos set reserva_hasta=now()-interval '1 minute' where pedidos.id=v_pedido_id;
  assert public.liberar_reservas_vencidas() >= 1;
  perform public.liberar_reservas_vencidas();
  assert (select stock = 2 from public.variantes where producto_id='prueba-reservas');
  assert public.confirmar_pago_pedido(v_pedido_id,'pago-tardio')->>'estado' = 'no_pendiente';

  pedido := public.crear_pedido(uno,'Prueba','prueba@example.com','123','Dirección',80000,4995);
  v_pedido_id := (pedido->>'pedido_id')::uuid;
  update public.pedidos set reserva_hasta=now()-interval '1 minute' where pedidos.id=v_pedido_id;
  assert public.confirmar_pago_pedido(v_pedido_id,'pago-vencido')->>'estado' = 'reserva_vencida';
  assert (select stock = 2 from public.variantes where producto_id='prueba-reservas');

  pedido := public.crear_pedido(uno,'Prueba','prueba@example.com','123','Dirección',80000,4995);
  delete from public.pedidos where pedidos.id=(pedido->>'pedido_id')::uuid;
  assert (select stock = 2 from public.variantes where producto_id='prueba-reservas'), 'Borrar un pendiente debe liberar la reserva';

  -- Un pedido creado antes de la migración sigue descontando al confirmar.
  insert into public.pedidos(total,nombre,email) values(100,'Legado','legado@example.com') returning pedidos.id into legado;
  insert into public.items_pedido(pedido_id,producto_id,variante_id,cantidad,precio_unitario)
    values(legado,'prueba-reservas','s',1,100);
  assert public.confirmar_pago_pedido(legado,'pago-legado')->>'estado' = 'pagado';
  assert (select stock = 1 from public.variantes where producto_id='prueba-reservas');
  assert public.cambiar_estado_pedido(legado,'enviado')->>'estado' = 'enviado';
  assert public.confirmar_pago_pedido(legado,'pago-legado')->>'estado' = 'ya_pagado';
  assert (select stock = 1 from public.variantes where producto_id='prueba-reservas');
end;
$$;
rollback;
