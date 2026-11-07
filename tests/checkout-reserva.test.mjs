import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTS } from './cargar-ts.mjs';

const id = '00000000-0000-0000-0000-000000000023';
const token = '00000000-0000-0000-0000-000000000024';
const vence = new Date(Date.now() + 30 * 60 * 1000).toISOString();
function preparar({ mpFalla = false, catalogoFalla = false } = {}) {
  const llamadas = { rpc: [], preferencia: null };
  const cliente = {
    async rpc(nombre, args) {
      llamadas.rpc.push({ nombre, args });
      if (nombre !== 'crear_pedido') return { data: { estado: 'cancelado' }, error: null };
      return { error: null, data: { pedido_id: id, token_comprobante: token, reserva_hasta: vence,
        subtotal: 100, envio: 4995, total: 5095,
        items: [{ producto_id: 'producto', variante_id: 's', cantidad: 1, precio_unitario: 100 }],
      } };
    },
    from() { return { select() { return this; }, in: async () => ({ data: [{ id: 'producto', nombre: 'Prueba', variantes: [{ id: 's', talle: 'S', color: 'Negro' }] }], error: catalogoFalla ? new Error('DB') : null }) }; },
  };
  const { crearPedido } = cargarTS('app/checkout/actions.ts', {
    'next/headers': { headers: async () => new Headers() },
    '@/lib/productos': { normalizarIdProducto: (valor) => valor },
    '@/lib/utils': { COSTE_ENVIO: 4995, ENVIO_GRATIS_DESDE: 80000 },
    '@/lib/supabase/admin': { createSupabaseAdminClient: () => cliente },
    '@/lib/mercadopago': { mercadopagoFetch: async (path, init) => {
      assert.equal(path, '/checkout/preferences');
      llamadas.preferencia = JSON.parse(init.body);
      return mpFalla ? new Response('error', { status: 500 }) : Response.json({ init_point: 'https://www.mercadopago.com.ar/checkout/prueba' });
    } },
  }, { process: { env: { APP_URL: 'https://tienda.example' } } });
  const form = new FormData();
  for (const [key, value] of Object.entries({ nombre: 'Prueba', email: 'prueba@example.com', telefono: '123', direccion: 'Prueba', items: JSON.stringify([{ productoId: 'producto', varianteId: 's', cantidad: 1, precio: 1 }]) })) form.set(key, value);
  return { crearPedido: () => crearPedido(form), llamadas };
}
test('la preferencia vence junto con la reserva y el retorno lleva la referencia privada', async () => {
  const { crearPedido, llamadas } = preparar();
  assert.equal((await crearPedido()).pedido.id, id);
  assert.equal(llamadas.preferencia.expires, true);
  assert.equal(llamadas.preferencia.expiration_date_to, vence);
  assert.equal(llamadas.preferencia.items[0].unit_price, 100);
  for (const url of Object.values(llamadas.preferencia.back_urls)) {
    assert.equal(new URL(url).searchParams.get('comprobante'), token);
  }
});
for (const opciones of [{ mpFalla: true }, { catalogoFalla: true }]) {
  test(`si no puede iniciar el pago cancela y libera la reserva: ${JSON.stringify(opciones)}`, async () => {
    const { crearPedido, llamadas } = preparar(opciones);
    assert.ok((await crearPedido()).error);
    assert.equal(llamadas.rpc[1].nombre, 'cambiar_estado_pedido');
    assert.equal(llamadas.rpc[1].args.p_estado, 'cancelado');
  });
}
