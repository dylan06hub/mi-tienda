-- Solo en una base de prueba con schema.sql y consultas.sql instalados.
begin;
insert into auth.users(id) values ('00000000-0000-0000-0000-000000000031');
insert into public.admins(user_id) values ('00000000-0000-0000-0000-000000000031');
insert into public.consultas(nombre,email,asunto,mensaje)
values ('Prueba','prueba@example.com','Consulta de prueba','Primera línea' || chr(10) || 'Segunda línea');

do $$
begin
  assert not has_table_privilege('anon','public.consultas','SELECT');
  assert not has_table_privilege('anon','public.consultas','INSERT');
  assert not has_table_privilege('authenticated','public.consultas','INSERT');
  assert not has_table_privilege('authenticated','public.consultas','UPDATE');
  assert not has_table_privilege('authenticated','public.consultas','DELETE');
  begin
    insert into public.consultas(nombre,email,asunto,mensaje)
    values ('Prueba','sin-email','Prueba','Mensaje');
    assert false, 'Debe rechazar un correo inválido';
  exception when check_violation then null;
  end;
  begin
    insert into public.consultas(nombre,email,asunto,mensaje)
    values ('Prueba','prueba@example.com','Prueba',repeat('a',1001));
    assert false, 'Debe rechazar mensajes demasiado largos';
  exception when check_violation then null;
  end;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000032',true);
do $$
begin
  assert (select count(*)=0 from public.consultas), 'Una sesión sin permisos no debe leer consultas';
  begin
    insert into public.consultas(nombre,email,asunto,mensaje)
    values ('Prueba','prueba@example.com','Prueba','Mensaje');
    assert false, 'El cliente no debe insertar directamente';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000031',true);
do $$
begin
  assert (select count(*)=1 from public.consultas), 'El administrador debe ver la consulta';
  assert (select position(chr(10) in mensaje)>0 from public.consultas), 'Debe conservar los saltos de línea';
end;
$$;
reset role;
rollback;
