-- Pedidos y confirmación de pagos con Mercado Pago.
-- Ejecutar en el SQL Editor de Supabase después de schema.sql.
--
-- crear_pedido valida precios y stock y crea pedido + items sin descontar
-- stock. El stock se descuenta recién cuando Mercado Pago confirma el pago
-- aprobado con confirmar_pago_pedido.

create or replace function public.crear_pedido(
  p_items jsonb,
  p_nombre text,
  p_email text,
  p_telefono text,
  p_direccion text,
  p_envio_gratis_desde numeric,
  p_coste_envio numeric
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pedido_id uuid;
  v_subtotal numeric(12, 2) := 0;
  v_envio numeric(12, 2) := 0;
  v_total numeric(12, 2) := 0;
  v_lineas jsonb := '[]'::jsonb;
  v_item record;
  v_stock integer;
  v_precio numeric(12, 2);
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'CARRITO_INVALIDO';
  end if;

  if jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 100 then
    raise exception 'CARRITO_INVALIDO';
  end if;

  if p_nombre is null or btrim(p_nombre) = ''
    or p_email is null or btrim(p_email) = ''
    or p_telefono is null or btrim(p_telefono) = ''
    or p_direccion is null or btrim(p_direccion) = ''
  then
    raise exception 'DATOS_INVALIDOS';
  end if;

  if p_envio_gratis_desde is null or p_envio_gratis_desde < 0
    or p_coste_envio is null or p_coste_envio < 0
  then
    raise exception 'DATOS_INVALIDOS';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as x(
      producto_id text,
      variante_id text,
      cantidad integer
    )
    where x.producto_id is null or btrim(x.producto_id) = ''
      or x.variante_id is null or btrim(x.variante_id) = ''
      or x.cantidad is null or x.cantidad <= 0
  ) then
    raise exception 'CARRITO_INVALIDO';
  end if;

  -- Orden determinista para que dos checkouts con solapamiento no se bloqueen
  -- mutuamente en distinto orden.
  for v_item in
    select
      x.producto_id,
      x.variante_id,
      sum(x.cantidad)::integer as cantidad
    from jsonb_to_recordset(p_items) as x(
      producto_id text,
      variante_id text,
      cantidad integer
    )
    group by x.producto_id, x.variante_id
    order by x.producto_id, x.variante_id
  loop
    select v.stock, p.precio
      into v_stock, v_precio
      from public.variantes v
      join public.productos p on p.id = v.producto_id
      where v.producto_id = v_item.producto_id
        and v.id = v_item.variante_id
        and p.activo = true
      for update of v, p;

    if not found then
      raise exception 'PRODUCTO_NO_DISPONIBLE';
    end if;

    if v_stock < v_item.cantidad then
      raise exception 'STOCK_INSUFICIENTE';
    end if;

    v_subtotal := v_subtotal + v_precio * v_item.cantidad;
    v_lineas := v_lineas || jsonb_build_object(
      'producto_id', v_item.producto_id,
      'variante_id', v_item.variante_id,
      'cantidad', v_item.cantidad,
      'precio_unitario', v_precio
    );
  end loop;

  v_envio := case
    when v_subtotal >= p_envio_gratis_desde then 0
    else p_coste_envio
  end;
  v_total := v_subtotal + v_envio;

  insert into public.pedidos (
    estado,
    total,
    nombre,
    email,
    telefono,
    direccion
  )
  values (
    'pendiente',
    v_total,
    btrim(p_nombre),
    lower(btrim(p_email)),
    btrim(p_telefono),
    btrim(p_direccion)
  )
  returning id into v_pedido_id;

  insert into public.items_pedido (
    pedido_id,
    producto_id,
    variante_id,
    cantidad,
    precio_unitario
  )
  select
    v_pedido_id,
    x.producto_id,
    x.variante_id,
    x.cantidad,
    x.precio_unitario
  from jsonb_to_recordset(v_lineas) as x(
    producto_id text,
    variante_id text,
    cantidad integer,
    precio_unitario numeric
  );

  return jsonb_build_object(
    'pedido_id', v_pedido_id,
    'subtotal', v_subtotal,
    'envio', v_envio,
    'total', v_total,
    'items', v_lineas
  );
end;
$$;

revoke all on function public.crear_pedido(
  jsonb, text, text, text, text, numeric, numeric
) from public;

grant execute on function public.crear_pedido(
  jsonb, text, text, text, text, numeric, numeric
) to service_role;

-- Confirma un pago aprobado y descuenta stock una sola vez.
-- El lock del pedido serializa webhooks duplicados: el segundo encuentra el
-- pedido en 'pagado' y no vuelve a descontar.
create or replace function public.confirmar_pago_pedido(
  p_pedido_id uuid,
  p_payment_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_estado text;
  v_item record;
  v_stock integer;
  v_lineas jsonb := '[]'::jsonb;
begin
  if p_pedido_id is null
    or p_payment_id is null or btrim(p_payment_id) = ''
  then
    raise exception 'DATOS_INVALIDOS';
  end if;

  select estado
    into v_estado
    from public.pedidos
    where id = p_pedido_id
    for update;

  if not found then
    return jsonb_build_object('estado', 'no_encontrado');
  end if;

  if v_estado = 'pagado' then
    return jsonb_build_object('estado', 'ya_pagado');
  end if;

  if v_estado <> 'pendiente' then
    return jsonb_build_object('estado', 'no_pendiente');
  end if;

  -- Primero se bloquean y validan todas las variantes, sin descontar nada.
  -- Así un pago sin stock deja el pedido cancelado y el stock intacto.
  for v_item in
    select i.producto_id, i.variante_id, i.cantidad
    from public.items_pedido i
    where i.pedido_id = p_pedido_id
    order by i.producto_id, i.variante_id
  loop
    select v.stock
      into v_stock
      from public.variantes v
      join public.productos p on p.id = v.producto_id
      where v.producto_id = v_item.producto_id
        and v.id = v_item.variante_id
        and p.activo = true
      for update of v, p;

    if not found then
      update public.pedidos
      set estado = 'cancelado', mp_payment_id = p_payment_id
      where id = p_pedido_id;

      return jsonb_build_object('estado', 'producto_no_disponible');
    end if;

    if v_stock < v_item.cantidad then
      update public.pedidos
      set estado = 'cancelado', mp_payment_id = p_payment_id
      where id = p_pedido_id;

      return jsonb_build_object('estado', 'stock_insuficiente');
    end if;

    v_lineas := v_lineas || jsonb_build_object(
      'producto_id', v_item.producto_id,
      'variante_id', v_item.variante_id,
      'cantidad', v_item.cantidad
    );
  end loop;

  for v_item in
    select x.producto_id, x.variante_id, x.cantidad
    from jsonb_to_recordset(v_lineas) as x(
      producto_id text,
      variante_id text,
      cantidad integer
    )
  loop
    update public.variantes
    set stock = stock - v_item.cantidad
    where producto_id = v_item.producto_id
      and id = v_item.variante_id;
  end loop;

  update public.pedidos
  set estado = 'pagado', mp_payment_id = p_payment_id
  where id = p_pedido_id;

  return jsonb_build_object('estado', 'pagado');
end;
$$;

revoke all on function public.confirmar_pago_pedido(uuid, text) from public;
grant execute on function public.confirmar_pago_pedido(uuid, text) to service_role;

-- Cambia el estado de un pedido desde el panel de administración.
-- Solo permite enviar pedidos pagados o cancelar pedidos pendientes/pagados.
-- Al cancelar un pedido pagado devuelve el stock una sola vez.
create or replace function public.cambiar_estado_pedido(
  p_pedido_id uuid,
  p_estado text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_estado text;
  v_item record;
begin
  if p_pedido_id is null
    or p_estado is null
    or p_estado not in ('enviado', 'cancelado')
  then
    raise exception 'DATOS_INVALIDOS';
  end if;

  select estado
    into v_estado
    from public.pedidos
    where id = p_pedido_id
    for update;

  if not found then
    return jsonb_build_object('estado', 'no_encontrado');
  end if;

  if v_estado = p_estado then
    return jsonb_build_object(
      'estado', v_estado,
      'stock_devuelto', false
    );
  end if;

  if v_estado in ('enviado', 'cancelado') then
    return jsonb_build_object('estado', 'no_modificable');
  end if;

  if p_estado = 'enviado' then
    if v_estado <> 'pagado' then
      return jsonb_build_object('estado', 'transicion_invalida');
    end if;

    update public.pedidos
    set estado = 'enviado'
    where id = p_pedido_id;

    return jsonb_build_object('estado', 'enviado');
  end if;

  -- El stock se descontó al confirmar el pago; los pendientes no lo tocaron.
  if v_estado = 'pagado' then
    for v_item in
      select producto_id, variante_id, cantidad
      from public.items_pedido
      where pedido_id = p_pedido_id
      order by producto_id, variante_id
    loop
      update public.variantes
      set stock = stock + v_item.cantidad
      where producto_id = v_item.producto_id
        and id = v_item.variante_id;
    end loop;
  end if;

  update public.pedidos
  set estado = 'cancelado'
  where id = p_pedido_id;

  return jsonb_build_object(
    'estado', 'cancelado',
    'stock_devuelto', v_estado = 'pagado'
  );
end;
$$;

revoke all on function public.cambiar_estado_pedido(uuid, text) from public;
grant execute on function public.cambiar_estado_pedido(uuid, text) to service_role;
