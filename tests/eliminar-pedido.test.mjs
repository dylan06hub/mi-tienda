import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as jsxRuntime from 'react/jsx-runtime';
import { cargarTS } from './cargar-ts.mjs';

const id = '00000000-0000-0000-0000-000000000021';
function preparar({ autorizado = true, error = null, data = { id } } = {}) {
  const cambios = [], paths = [];
  const { eliminarPedido } = cargarTS('app/admin/(panel)/pedidos/actions.ts', {
    'next/cache': { revalidatePath: path => paths.push(path) },
    'next/navigation': { redirect: path => { throw Error(`REDIRECT:${path}`); } },
    '@/lib/admin-auth': { requireAdmin: async () => { if (!autorizado) throw Error('NO_ADMIN'); } },
    '@/lib/supabase/admin': { createSupabaseAdminClient: () => ({ from: table => {
      assert.equal(table, 'pedidos');
      return {
        update(values) { cambios.push(values); return this; },
        eq(field, value) { assert.equal(field, 'id'); assert.equal(value, id); return this; },
        select(fields) { assert.equal(fields, 'id'); return this; },
        maybeSingle: async () => ({ data, error }),
      };
    } }) },
  });
  const form = new FormData(); form.set('id', id);
  return { run: () => eliminarPedido(null, form), form, cambios, paths };
}

test('eliminar pedido solo lo quita del panel y conserva pagos, estado y stock', async () => {
  const { run, cambios, paths } = preparar();
  await assert.rejects(run(), /REDIRECT:\/admin\/pedidos/);
  assert.deepEqual(JSON.parse(JSON.stringify(cambios)), [{ eliminado_admin: true }]);
  assert.deepEqual(paths, ['/admin', '/admin/pedidos', `/admin/pedidos/${id}`]);
});
test('eliminar pedido exige administrador y un identificador válido antes de escribir', async () => {
  const denied = preparar({ autorizado: false });
  await assert.rejects(denied.run(), /NO_ADMIN/); assert.equal(denied.cambios.length, 0);
  const invalid = preparar(); invalid.form.set('id', 'invalido');
  assert.match((await invalid.run()).error, /inválido/); assert.equal(invalid.cambios.length, 0);
});
test('eliminar pedido muestra los errores y no redirige si no se guardó', async () => {
  const failed = preparar({ error: { message: 'falló' } });
  assert.match((await failed.run()).error, /No se pudo eliminar/); assert.equal(failed.paths.length, 0);
  assert.match((await preparar({ data: null }).run()).error, /no existe/);
});
test('el listado administrativo omite eliminados sin cambiar los datos públicos de pagos', async () => {
  const filters = [];
  const { getPedidosAdmin } = cargarTS('lib/pedidos.ts', {
    'server-only': {}, react: { cache: fn => fn },
    '@/lib/supabase/server': { createSupabaseServerClient: async () => ({ from: () => ({
      select() { return this; }, eq(field, value) { filters.push([field, value]); return this; },
      order: async () => ({ data: [], error: null }),
    }) }) },
  });
  assert.equal((await getPedidosAdmin()).length, 0);
  assert.deepEqual(filters, [['eliminado_admin', false]]);
});
test('productos y acciones de pedido se ejecutan sin pedir confirmación', () => {
  const react = { useActionState: () => [null, () => {}, false] };
  const { DeleteProductButton } = cargarTS('app/admin/(panel)/productos/DeleteProductButton.tsx', {
    react, 'react/jsx-runtime': jsxRuntime, './actions': { eliminarProducto() {} },
  });
  assert.equal(DeleteProductButton({ id: 'prenda', nombre: 'Prenda' }).props.onSubmit, undefined);
  const { AccionesPedido } = cargarTS('app/admin/(panel)/pedidos/AccionesPedido.tsx', {
    react, 'react/jsx-runtime': jsxRuntime, './actions': { cambiarEstadoPedido() {} },
  });
  const form = AccionesPedido({ id, acciones: [{ estado: 'cancelado', label: 'Cancelar' }] });
  const button = form.props.children[1].props.children[0][0];
  assert.equal(button.props.onClick, undefined);
});
