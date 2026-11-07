import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTS } from './cargar-ts.mjs';

const id = '00000000-0000-0000-0000-000000000021';
const token = '00000000-0000-0000-0000-000000000022';
function preparar(data = null) {
  const filtros = [];
  let consultas = 0;
  const { getResultadoPedido } = cargarTS('lib/resultado-pedido.ts', {
    'server-only': {},
    '@/lib/supabase/admin': { createSupabaseAdminClient: () => ({ from() {
      consultas++;
      return {
        select(campos) { assert.ok(!campos.includes('email')); return this; },
        eq(campo, valor) { filtros.push([campo, valor]); return this; },
        maybeSingle: async () => ({ data, error: null }),
      };
    } }) },
  });
  return { getResultadoPedido, filtros, consultas: () => consultas };
}

test('sin referencia privada válida no consulta datos ni autoriza una limpieza', async () => {
  const { getResultadoPedido, consultas } = preparar();
  for (const [pedido, comprobante] of [[undefined, undefined], [id, undefined], [id, 'invalido'], [[id], token]]) {
    assert.equal(await getResultadoPedido(pedido, comprobante), null);
  }
  assert.equal(consultas(), 0);
});
test('la consulta exige tanto el pedido como su comprobante privado', async () => {
  const { getResultadoPedido, filtros } = preparar();
  assert.equal(await getResultadoPedido(id, token), null);
  assert.deepEqual(filtros, [['id', id], ['token_comprobante', token]]);
});
test('devuelve estado e items y detecta incidencias sin exponer datos de contacto', async () => {
  const { getResultadoPedido } = preparar({ id, estado: 'pagado',
    items_pedido: [{ producto_id: 'producto', variante_id: 's', cantidad: 2 }],
    incidencias_pago: [{ resuelta_en: null }],
  });
  const resultado = await getResultadoPedido(id, token);
  assert.equal(resultado.estado, 'pagado');
  assert.equal(resultado.revision, true);
  assert.equal(resultado.items[0].cantidad, 2);
  assert.equal('email' in resultado, false);
});

const jsx = (type, props) => ({ type, props });
for (const estado of [null, 'pendiente', 'cancelado', 'pagado', 'enviado']) {
  test(`la página solo limpia el carrito para un pedido confirmado: ${estado}`, async () => {
    const LimpiarCarrito = () => null;
    const { default: Page } = cargarTS('app/checkout/resultado/page.tsx', {
      'next/link': { default: 'link', __esModule: true },
      'next/server': { connection: async () => {} },
      react: { Suspense: 'suspense' },
      'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
      '@/lib/resultado-pedido': { getResultadoPedido: async () => estado ? { id, estado, revision: false, items: [] } : null },
      './ActualizarEstado': { ActualizarEstado: () => null },
      './LimpiarCarrito': { LimpiarCarrito },
    });
    const page = Page({ searchParams: Promise.resolve({ pedido: id, comprobante: token, estado: 'exito' }) });
    const nodo = page.props.children.props.children;
    const resultado = await nodo.type(nodo.props);
    const children = [].concat(resultado.props.children ?? []);
    assert.equal(children.some((child) => child?.type === LimpiarCarrito), ['pagado', 'enviado'].includes(estado));
  });
}
