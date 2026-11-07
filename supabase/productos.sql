-- Ejecutar después de schema.sql y sections.sql, antes de desplegar el formulario.
-- La función usa el JWT y las políticas RLS del administrador, sin service_role.
begin;

create or replace function public.guardar_producto(
  p_id text,
  p_nuevo boolean,
  p_datos jsonb,
  p_variantes jsonb,
  p_originales jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_actuales jsonb;
  v_originales jsonb;
begin
  if public.is_admin() is not true then
    raise exception 'NO_AUTORIZADO' using errcode = '42501';
  end if;

  if p_id is null or p_id !~ '^[a-z0-9-]+$' or p_nuevo is null
    or jsonb_typeof(p_datos) is distinct from 'object'
    or jsonb_typeof(p_variantes) is distinct from 'array'
    or jsonb_typeof(p_originales) is distinct from 'array'
  then
    raise exception 'DATOS_INVALIDOS';
  end if;

  if nullif(btrim(p_datos->>'nombre'), '') is null
    or nullif(btrim(p_datos->>'categoria'), '') is null
    or (p_datos->>'precio')::numeric is null
    or (p_datos->>'precio')::numeric <= 0
    or (p_datos->>'precio')::numeric > 9999999999.99
    or jsonb_array_length(p_variantes) = 0
  then
    raise exception 'DATOS_INVALIDOS';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_variantes)
      as x(id text, talle text, color text, stock integer)
    where nullif(btrim(x.id), '') is null
      or nullif(btrim(x.talle), '') is null
      or nullif(btrim(x.color), '') is null
      or x.stock is null or x.stock < 0
  ) or exists (
    select 1 from jsonb_to_recordset(p_variantes) as x(id text)
    group by x.id having count(*) > 1
  ) or exists (
    select 1
    from jsonb_to_recordset(p_variantes) as x(talle text, color text)
    group by lower(x.talle), lower(x.color) having count(*) > 1
  ) then
    raise exception 'VARIANTES_INVALIDAS';
  end if;

  if p_nuevo then
    insert into public.productos (id, nombre, precio, categoria)
    values (p_id, p_datos->>'nombre', (p_datos->>'precio')::numeric,
      p_datos->>'categoria');
  else
    -- Mantener bloqueadas las variantes hasta terminar evita pisar ventas.
    perform 1 from public.variantes
    where producto_id = p_id order by id for update;
    perform 1 from public.productos where id = p_id for update;
    if not found then
      raise exception 'PRODUCTO_NO_ENCONTRADO';
    end if;

    select coalesce(jsonb_agg(jsonb_build_object(
      'id', id, 'talle', talle, 'color', color, 'stock', stock
    ) order by id), '[]'::jsonb)
    into v_actuales from public.variantes where producto_id = p_id;

    select coalesce(jsonb_agg(to_jsonb(x) order by x.id), '[]'::jsonb)
    into v_originales
    from jsonb_to_recordset(p_originales)
      as x(id text, talle text, color text, stock integer);

    if v_actuales <> v_originales then
      raise exception 'VARIANTES_DESACTUALIZADAS';
    end if;

    -- Cambiar la identidad requiere un nuevo id para conservar el historial.
    if exists (
      select 1 from public.variantes v
      join jsonb_to_recordset(p_variantes) as x(id text, talle text, color text)
        on x.id = v.id
      where v.producto_id = p_id
        and (lower(v.talle) <> lower(x.talle) or lower(v.color) <> lower(x.color))
    ) then
      raise exception 'VARIANTES_INVALIDAS';
    end if;
  end if;

  update public.productos set
    nombre = p_datos->>'nombre',
    descripcion = p_datos->>'descripcion',
    precio = (p_datos->>'precio')::numeric,
    categoria = p_datos->>'categoria',
    imagen = coalesce(p_datos->>'imagen', imagen),
    activo = (p_datos->>'activo')::boolean,
    destacado = (p_datos->>'destacado')::boolean,
    oferta = (p_datos->>'oferta')::boolean
  where id = p_id;

  -- La FK impide borrar variantes con pedidos; cualquier error revierte todo.
  delete from public.variantes v
  where v.producto_id = p_id
    and not exists (
      select 1 from jsonb_to_recordset(p_variantes) as x(id text)
      where x.id = v.id
    );

  insert into public.variantes (producto_id, id, talle, color, stock)
  select p_id, x.id, x.talle, x.color, x.stock
  from jsonb_to_recordset(p_variantes)
    as x(id text, talle text, color text, stock integer)
  on conflict (producto_id, id) do update set
    talle = excluded.talle, color = excluded.color, stock = excluded.stock;
end;
$$;

revoke all on function public.guardar_producto(text, boolean, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.guardar_producto(text, boolean, jsonb, jsonb, jsonb) to authenticated;

commit;
