-- Fase 2. Ejecutar después de checkout.sql. Conserva los pedidos anteriores.
begin;

alter table public.pedidos
  add column if not exists reserva_hasta timestamptz,
  add column if not exists stock_reservado boolean not null default false,
  add column if not exists token_comprobante uuid not null default gen_random_uuid();

create index if not exists pedidos_reservas_vencidas_idx
on public.pedidos(reserva_hasta) where estado = 'pendiente' and stock_reservado;

create table if not exists public.incidencias_pago (
  mp_payment_id text primary key,
  pedido_id uuid references public.pedidos(id) on delete set null,
  referencia text,
  motivo text not null,
  monto numeric,
  moneda text,
  creado_en timestamptz not null default now(),
  resuelta_en timestamptz,
  resolucion text
);
alter table public.incidencias_pago enable row level security;
drop policy if exists incidencias_admin_lectura on public.incidencias_pago;
create policy incidencias_admin_lectura on public.incidencias_pago
for select to authenticated using (public.is_admin());
revoke all on public.incidencias_pago from anon, authenticated;
grant select on public.incidencias_pago to authenticated;
grant all on public.incidencias_pago to service_role;

-- Solo se llama con el pedido bloqueado y tras comprobar su estado.
create or replace function public.devolver_stock_pedido(p_pedido_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_item record;
begin
  for v_item in
    select producto_id, variante_id, cantidad from public.items_pedido
    where pedido_id = p_pedido_id order by producto_id, variante_id
  loop
    update public.variantes set stock = stock + v_item.cantidad
    where producto_id = v_item.producto_id and id = v_item.variante_id;
  end loop;
end;
$$;
revoke all on function public.devolver_stock_pedido(uuid) from public, anon, authenticated;

create or replace function public.liberar_reservas_vencidas()
returns integer language plpgsql security definer set search_path = '' as $$
declare v_pedido record; v_cantidad integer := 0;
begin
  for v_pedido in
    select id from public.pedidos
    where estado = 'pendiente' and stock_reservado and reserva_hasta <= now()
    order by id for update skip locked
  loop
    perform public.devolver_stock_pedido(v_pedido.id);
    update public.pedidos set estado = 'cancelado', stock_reservado = false
    where id = v_pedido.id;
    v_cantidad := v_cantidad + 1;
  end loop;
  return v_cantidad;
end;
$$;
revoke all on function public.liberar_reservas_vencidas() from public, anon, authenticated;
grant execute on function public.liberar_reservas_vencidas() to service_role;

-- También protege la limpieza de pedidos de las versiones anteriores de la app.
create or replace function public.liberar_reserva_al_borrar()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.estado = 'pendiente' and old.stock_reservado then
    perform public.devolver_stock_pedido(old.id);
  end if;
  return old;
end;
$$;
revoke all on function public.liberar_reserva_al_borrar() from public, anon, authenticated;
drop trigger if exists liberar_reserva_al_borrar on public.pedidos;
create trigger liberar_reserva_al_borrar before delete on public.pedidos
for each row execute function public.liberar_reserva_al_borrar();
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
  v_reserva_hasta timestamptz := now() + interval '30 minutes';
  v_token uuid;
begin
  perform public.liberar_reservas_vencidas();

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
    perform 1 from public.variantes
    where producto_id = v_item.producto_id and id = v_item.variante_id for update;

    select v.stock, p.precio
      into v_stock, v_precio
      from public.variantes v
      join public.productos p on p.id = v.producto_id
      where v.producto_id = v_item.producto_id
        and v.id = v_item.variante_id
        and p.activo = true;

    if not found then
      raise exception 'PRODUCTO_NO_DISPONIBLE';
    end if;

    if v_stock < v_item.cantidad then
      raise exception 'STOCK_INSUFICIENTE';
    end if;

    update public.variantes set stock = stock - v_item.cantidad
    where producto_id = v_item.producto_id and id = v_item.variante_id;

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
    direccion,
    reserva_hasta,
    stock_reservado
  )
  values (
    'pendiente',
    v_total,
    btrim(p_nombre),
    lower(btrim(p_email)),
    btrim(p_telefono),
    btrim(p_direccion),
    v_reserva_hasta,
    true
  )
  returning id, token_comprobante into v_pedido_id, v_token;

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
    'token_comprobante', v_token,
    'reserva_hasta', v_reserva_hasta,
    'subtotal', v_subtotal,
    'envio', v_envio,
    'total', v_total,
    'items', v_lineas
  );
end;
$$;

revoke all on function public.crear_pedido(
  jsonb, text, text, text, text, numeric, numeric
) from public, anon, authenticated;

grant execute on function public.crear_pedido(
  jsonb, text, text, text, text, numeric, numeric
) to service_role;


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
  v_payment_id text;
  v_reservado boolean;
  v_hasta timestamptz;
  v_item record;
  v_stock integer;
  v_lineas jsonb := '[]'::jsonb;
begin
  if p_pedido_id is null
    or p_payment_id is null or btrim(p_payment_id) = ''
  then
    raise exception 'DATOS_INVALIDOS';
  end if;

  select estado, mp_payment_id, stock_reservado, reserva_hasta
    into v_estado, v_payment_id, v_reservado, v_hasta
    from public.pedidos
    where id = p_pedido_id
    for update;

  if not found then
    return jsonb_build_object('estado', 'no_encontrado');
  end if;

  if v_payment_id = p_payment_id then
    return jsonb_build_object('estado', 'ya_pagado');
  end if;

  if v_payment_id is not null or v_estado in ('pagado', 'enviado') then
    return jsonb_build_object('estado', 'pago_duplicado');
  end if;

  if v_estado <> 'pendiente' then
    return jsonb_build_object('estado', 'no_pendiente');
  end if;

  if v_reservado then
    if v_hasta <= now() then
      perform public.devolver_stock_pedido(p_pedido_id);
      update public.pedidos set estado = 'cancelado', stock_reservado = false
      where id = p_pedido_id;
      return jsonb_build_object('estado', 'reserva_vencida');
    end if;

    update public.pedidos
    set estado = 'pagado', stock_reservado = false, mp_payment_id = p_payment_id
    where id = p_pedido_id;
    return jsonb_build_object('estado', 'pagado');
  end if;

  -- Los pedidos anteriores a esta migración no tenían reservas.
  -- Primero se bloquean y validan todas las variantes, sin descontar nada.
  -- Así un pago sin stock deja el pedido cancelado y el stock intacto.
  for v_item in
    select i.producto_id, i.variante_id, i.cantidad
    from public.items_pedido i
    where i.pedido_id = p_pedido_id
    order by i.producto_id, i.variante_id
  loop
    perform 1 from public.variantes
    where producto_id = v_item.producto_id and id = v_item.variante_id for update;

    select v.stock
      into v_stock
      from public.variantes v
      join public.productos p on p.id = v.producto_id
      where v.producto_id = v_item.producto_id
        and v.id = v_item.variante_id
        and p.activo = true;

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

revoke all on function public.confirmar_pago_pedido(uuid, text) from public, anon, authenticated;
grant execute on function public.confirmar_pago_pedido(uuid, text) to service_role;

create or replace function public.cambiar_estado_pedido(p_pedido_id uuid, p_estado text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_pedido public.pedidos%rowtype; v_devolver boolean;
begin
  if p_pedido_id is null or p_estado is null or p_estado not in ('enviado','cancelado') then
    raise exception 'DATOS_INVALIDOS';
  end if;
  select * into v_pedido from public.pedidos where id = p_pedido_id for update;
  if not found then return jsonb_build_object('estado','no_encontrado'); end if;
  if v_pedido.estado = p_estado then
    return jsonb_build_object('estado',p_estado,'stock_devuelto',false);
  end if;
  if v_pedido.estado in ('enviado','cancelado') then
    return jsonb_build_object('estado','no_modificable');
  end if;
  if p_estado = 'enviado' then
    if v_pedido.estado <> 'pagado' then
      return jsonb_build_object('estado','transicion_invalida');
    end if;
    update public.pedidos set estado = 'enviado' where id = p_pedido_id;
    return jsonb_build_object('estado','enviado');
  end if;

  v_devolver := v_pedido.stock_reservado or v_pedido.estado = 'pagado';
  if v_devolver then perform public.devolver_stock_pedido(p_pedido_id); end if;
  if v_pedido.estado = 'pagado' and v_pedido.mp_payment_id is not null then
    insert into public.incidencias_pago(mp_payment_id,pedido_id,motivo,monto,moneda)
    values(v_pedido.mp_payment_id,p_pedido_id,'pedido_cancelado_revisar_reembolso',v_pedido.total,'ARS')
    on conflict(mp_payment_id) do update set
      motivo = excluded.motivo, resuelta_en = null, resolucion = null;
  end if;
  update public.pedidos set estado = 'cancelado', stock_reservado = false where id = p_pedido_id;
  return jsonb_build_object('estado','cancelado','stock_devuelto',v_devolver);
end;
$$;
revoke all on function public.cambiar_estado_pedido(uuid,text) from public, anon, authenticated;
grant execute on function public.cambiar_estado_pedido(uuid,text) to service_role;

commit;

