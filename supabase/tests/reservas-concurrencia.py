"""Solo para una base de prueba. Usa las variables PGHOST/PGPORT/PGDATABASE de psql."""
import os
import shutil
import subprocess
import uuid

psql = shutil.which('psql')
if not psql:
    raise SystemExit('Se necesita psql en PATH.')
args = [psql, '-X', '-At', '-v', 'ON_ERROR_STOP=1']
producto = 'prueba-concurrencia-' + str(uuid.uuid4())

def sql(query, check=True):
    result = subprocess.run(args, input=query, text=True, capture_output=True, timeout=20)
    if check and result.returncode:
        raise AssertionError(result.stderr)
    return result

sql(f"""
insert into public.productos(id,nombre,precio,categoria) values ('{producto}','Prueba temporal',100,'Prueba');
insert into public.variantes(producto_id,id,talle,color,stock) values ('{producto}','s','S','Negro',1);
""")
consulta = f"""select public.crear_pedido(
 '[{{"producto_id":"{producto}","variante_id":"s","cantidad":1}}]',
 'Prueba','prueba@example.com','123','Dirección',80000,4995);"""
primero = None
try:
    primero = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        env={**os.environ, 'PGOPTIONS': '-c statement_timeout=15000'})
    primero.stdin.write("begin;\n" + consulta + "\nselect 'RESERVA_EN_CURSO'; select pg_sleep(2); commit;\n")
    primero.stdin.flush()
    while True:
        line = primero.stdout.readline()
        if line.strip() == 'RESERVA_EN_CURSO':
            break
        if not line:
            raise AssertionError(primero.stderr.read())
    segundo = sql(consulta, check=False)
    primero.stdin.close()
    assert primero.wait(timeout=20) == 0, primero.stderr.read()
    assert segundo.returncode != 0 and 'STOCK_INSUFICIENTE' in segundo.stderr, segundo.stderr
    assert sql(f"select stock from public.variantes where producto_id='{producto}';").stdout.strip() == '0'
    assert sql(f"select count(*) from public.items_pedido where producto_id='{producto}';").stdout.strip() == '1'
    print('OK: dos compras simultáneas de la última unidad producen una sola reserva.')
finally:
    if primero is not None and primero.poll() is None:
        primero.terminate()
        primero.wait(timeout=20)
    sql(f"""
    delete from public.pedidos where id in (select pedido_id from public.items_pedido where producto_id='{producto}');
    delete from public.productos where id='{producto}';
    """)
