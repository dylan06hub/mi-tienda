"""Solo para una base de prueba. Usa las variables PGHOST/PGPORT/PGDATABASE de psql."""
import json
import os
import shutil
import subprocess
import uuid

psql = shutil.which('psql')
if not psql:
    raise SystemExit('Se necesita psql en PATH.')
args = [psql, '-X', '-At', '-v', 'ON_ERROR_STOP=1']
sufijo = str(uuid.uuid4())
producto = 'prueba-concurrencia-' + sufijo
admin = str(uuid.uuid4())
pago = 'pago-concurrencia-' + sufijo


def sql(query, check=True):
    result = subprocess.run(args, input=query, text=True, capture_output=True, timeout=20)
    if check and result.returncode:
        raise AssertionError(result.stderr)
    return result


def simultaneos(primera, segunda):
    proceso = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        env={**os.environ, 'PGOPTIONS': '-c statement_timeout=15000'})
    try:
        proceso.stdin.write("begin;\n" + primera + "\nselect 'OPERACION_EN_CURSO'; select pg_sleep(1); commit;\n")
        proceso.stdin.flush()
        while True:
            line = proceso.stdout.readline()
            if line.strip() == 'OPERACION_EN_CURSO':
                break
            if not line:
                raise AssertionError(proceso.stderr.read())
        resultado = sql(segunda, check=False)
        proceso.stdin.close()
        assert proceso.wait(timeout=20) == 0, proceso.stderr.read()
        return resultado
    finally:
        if proceso.poll() is None:
            proceso.terminate()
            proceso.wait(timeout=20)


sql(f"""
insert into auth.users(id) values ('{admin}');
insert into public.admins(user_id) values ('{admin}');
insert into public.productos(id,nombre,precio,categoria) values ('{producto}','Prueba temporal',100,'Prueba');
insert into public.variantes(producto_id,id,talle,color,stock) values ('{producto}','s','S','Negro',1);
""")
consulta = f"""select public.crear_pedido(
 '[{{"producto_id":"{producto}","variante_id":"s","cantidad":1}}]',
 'Prueba','prueba@example.com','123','Dirección',80000,4995);"""
try:
    segundo = simultaneos(consulta, consulta)
    assert segundo.returncode != 0 and 'STOCK_INSUFICIENTE' in segundo.stderr, segundo.stderr
    assert sql(f"select stock from public.variantes where producto_id='{producto}';").stdout.strip() == '0'
    assert sql(f"select count(*) from public.items_pedido where producto_id='{producto}';").stdout.strip() == '1'
    print('OK: dos compras simultáneas de la última unidad producen una sola reserva.')

    pedido = sql(f"select pedido_id from public.items_pedido where producto_id='{producto}';").stdout.strip()
    confirmar = f"select public.confirmar_pago_pedido('{pedido}','{pago}');"
    duplicado = simultaneos(confirmar, confirmar)
    assert duplicado.returncode == 0 and json.loads(duplicado.stdout)['estado'] == 'ya_pagado', duplicado.stderr
    assert sql(f"select stock from public.variantes where producto_id='{producto}';").stdout.strip() == '0'
    print('OK: dos confirmaciones simultáneas descuentan stock una sola vez.')

    cancelar = f"select public.cambiar_estado_pedido('{pedido}','cancelado');"
    cancelado = simultaneos(confirmar, cancelar)
    assert cancelado.returncode == 0 and json.loads(cancelado.stdout)['stock_devuelto'], cancelado.stderr
    sql(cancelar)
    assert sql(f"select stock from public.variantes where producto_id='{producto}';").stdout.strip() == '1'
    print('OK: cancelar durante un webhook devuelve stock una sola vez.')

    nuevo = json.loads(sql(consulta).stdout)['pedido_id']
    tardio = simultaneos(
        f"select public.cambiar_estado_pedido('{nuevo}','cancelado');",
        f"select public.confirmar_pago_pedido('{nuevo}','pago-tardio-{sufijo}');")
    assert tardio.returncode == 0 and json.loads(tardio.stdout)['estado'] == 'no_pendiente', tardio.stderr
    assert sql(f"select stock from public.variantes where producto_id='{producto}';").stdout.strip() == '1'
    print('OK: una confirmación que espera a una cancelación no vuelve a consumir stock.')

    editar = f"""
    select set_config('request.jwt.claim.sub','{admin}',false);
    set role authenticated;
    select public.guardar_producto('{producto}',false,
      '{{"nombre":"No guardar","precio":200,"categoria":"Prueba","activo":true,"destacado":false,"oferta":false}}',
      '[{{"id":"s","talle":"S","color":"Negro","stock":1}}]',
      '[{{"id":"s","talle":"S","color":"Negro","stock":1}}]');
    """
    edicion = simultaneos(consulta, editar)
    assert edicion.returncode != 0 and 'VARIANTES_DESACTUALIZADAS' in edicion.stderr, edicion.stderr
    assert sql(f"select nombre || ':' || stock from public.productos p join public.variantes v on p.id=v.producto_id where p.id='{producto}';").stdout.strip() == 'Prueba temporal:0'
    print('OK: editar mientras se reserva no sobrescribe el inventario vendido.')
finally:
    sql(f"""
    delete from public.incidencias_pago where pedido_id in (select pedido_id from public.items_pedido where producto_id='{producto}');
    delete from public.pedidos where id in (select pedido_id from public.items_pedido where producto_id='{producto}');
    delete from public.productos where id='{producto}';
    delete from auth.users where id='{admin}';
    """)
