import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTS } from './cargar-ts.mjs';

function preparar({ autorizado = true, error = null, data = { id: 'prenda-con-pedidos' } } = {}) {
  const cambios = [], rutas = [];
  const { eliminarProducto } = cargarTS('app/admin/(panel)/productos/actions.ts', {
    'next/cache': { revalidatePath: ruta => rutas.push(ruta) },
    'next/navigation': { redirect: ruta => { throw Error(`REDIRECT:${ruta}`); } },
    '@/lib/admin-auth': { requireAdmin: async () => { if (!autorizado) throw Error('NO_ADMIN'); } },
    '@/lib/supabase/admin': { createSupabaseAdminClient: () => { throw Error('No debe tocar Storage'); } },
    '@/lib/supabase/server': { createSupabaseServerClient: async () => ({ from(tabla) {
      assert.equal(tabla, 'productos', 'el historial de pedidos no se consulta ni se borra para retirar una prenda');
      return {
        update(values) { cambios.push(values); return this; },
        eq(campo, valor) { assert.equal(campo, 'id'); assert.equal(valor, 'prenda-con-pedidos'); return this; },
        select(campos) { assert.equal(campos, 'id'); return this; },
        maybeSingle: async () => ({ data, error }),
      };
    } }) },
  });
  const form = new FormData(); form.set('id', 'prenda-con-pedidos');
  return { run: () => eliminarProducto(null, form), cambios, rutas, form };
}

test('eliminar una prenda con pedidos la retira sin borrar historial ni variantes', async () => {
  const { run, cambios, rutas } = preparar();
  await assert.rejects(run(), /REDIRECT:\/admin\/productos/);
  assert.deepEqual(JSON.parse(JSON.stringify(cambios)), [{ eliminado_admin: true, activo: false }]);
  assert.ok(rutas.includes('/productos'));
});
test('la eliminación de productos valida autorización, identificador y errores', async () => {
  const denied = preparar({ autorizado: false });
  await assert.rejects(denied.run(), /NO_ADMIN/); assert.equal(denied.cambios.length, 0);
  const invalid = preparar(); invalid.form.delete('id');
  assert.match((await invalid.run()).error, /inválido/); assert.equal(invalid.cambios.length, 0);
  assert.match((await preparar({ error: { message: 'falló' } }).run()).error, /No se pudo eliminar/);
  assert.match((await preparar({ data: null }).run()).error, /no existe/);
});
test('el catálogo y la edición omiten prendas eliminadas incluso con enlaces antiguos', async () => {
  const filtros = [];
  const { getProductosAdmin, getProductoAdmin, getProductos, getProducto } = cargarTS('lib/productos.ts', {
    'server-only': {}, react: { cache: fn => fn },
    '@/lib/supabase/server': { createSupabaseServerClient: async () => ({ from: () => ({
      select() { return this; }, eq(campo, valor) { filtros.push([campo, valor]); return this; },
      order: async () => ({ data: [], error: null }), maybeSingle: async () => ({ data: null, error: null }),
    }) }) },
  });
  for (const run of [getProductosAdmin, () => getProductoAdmin('prenda'), getProductos, () => getProducto('prenda')]) {
    filtros.length = 0; await run();
    assert.ok(filtros.some(([campo, valor]) => campo === 'eliminado_admin' && valor === false));
  }
});
