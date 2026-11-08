begin;
do $$
declare
  producto text := 'prueba-eliminacion-' || gen_random_uuid()::text;
  pedido uuid := gen_random_uuid();
begin
  insert into public.productos(id,nombre,precio,categoria) values(producto,'Prueba temporal',100,'Prueba');
  insert into public.variantes(id,producto_id,talle,color,stock) values('m',producto,'M','Negro',3);
  insert into public.pedidos(id,estado,total,nombre,email) values(pedido,'cancelado',100,'Prueba temporal','prueba@example.com');
  insert into public.items_pedido(pedido_id,producto_id,variante_id,cantidad,precio_unitario) values(pedido,producto,'m',1,100);

  update public.productos set eliminado_admin=true,activo=false where id=producto;
  if not exists(select 1 from public.items_pedido where pedido_id=pedido and producto_id=producto) then
    raise exception 'Se perdió el historial del pedido';
  end if;
  if not exists(select 1 from public.variantes where producto_id=producto and stock=3) then
    raise exception 'Se modificaron las variantes o el stock';
  end if;
  if exists(select 1 from public.productos where id=producto and (activo or not eliminado_admin)) then
    raise exception 'El producto sigue disponible';
  end if;
  begin
    update public.productos set activo=true where id=producto;
    raise exception 'Un formulario antiguo pudo volver a publicar el producto';
  exception when check_violation then null;
  end;
end $$;
rollback;
