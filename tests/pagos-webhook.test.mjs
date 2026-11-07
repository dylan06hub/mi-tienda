import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHmac } from 'node:crypto';
import { cargarTS } from './cargar-ts.mjs';

const pedidoId = '00000000-0000-0000-0000-000000000020';
function preparar({ pago = {}, estado = 'pagado', incidenteError = null, pedido = { total: 100 }, rpcError = null, secreto, apiStatus = 200, apiBody } = {}) {
  const llamadas = { incidencias: [], rpc: [], api: 0, apiUrls: [] };
  const supabase = {
    from(tabla) {
      if (tabla === 'incidencias_pago') return { upsert: async (fila, opciones) => {
        llamadas.incidencias.push({ fila, opciones }); return { error: incidenteError };
      } };
      assert.equal(tabla, 'pedidos');
      return { select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: pedido, error: null }) };
    },
    rpc: async (nombre, args) => { llamadas.rpc.push({ nombre, args }); return { data: { estado }, error: rpcError }; },
  };
  const { POST } = cargarTS('app/api/mercadopago/webhook/route.ts', {
    'next/cache': { revalidatePath() {} },
    '@/lib/supabase/admin': { createSupabaseAdminClient: () => supabase },
    '@/lib/mercadopago': { mercadopagoFetch: async (url) => {
      llamadas.api++;
      llamadas.apiUrls.push(url);
      return Response.json(apiBody === undefined
        ? { id: 123, status: 'approved', external_reference: pedidoId, transaction_amount: 100, currency_id: 'ARS', ...pago }
        : apiBody, { status: apiStatus });
    } },
  }, { process: { env: { MP_WEBHOOK_SECRET: secreto } } });
  const request = (body = { type: 'payment', data: { id: 123 } }, headers = {}, query = '') => new Request(`https://tienda.example/api/mercadopago/webhook${query}`, {
    method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json', ...headers },
  });
  return { POST, request, llamadas };
}

for (const estado of ['pagado', 'ya_pagado']) {
  test(`un pago ${estado} se confirma sin crear incidencias`, async () => {
    const { POST, request, llamadas } = preparar({ estado });
    assert.equal((await POST(request())).status, 200);
    assert.equal(llamadas.rpc[0].nombre, 'confirmar_pago_pedido');
    assert.equal(llamadas.incidencias.length, 0);
  });
}
for (const estado of ['reserva_vencida', 'pago_duplicado', 'no_pendiente', 'stock_insuficiente']) {
  test(`registra ${estado} de forma idempotente`, async () => {
    const { POST, request, llamadas } = preparar({ estado });
    assert.equal((await POST(request())).status, 200);
    assert.equal(llamadas.incidencias[0].fila.motivo, estado);
    assert.equal(llamadas.incidencias[0].fila.pedido_id, pedidoId);
    assert.equal(llamadas.incidencias[0].opciones.ignoreDuplicates, true);
  });
}
for (const [pago, motivo] of [
  [{ transaction_amount: 1 }, 'importe_o_moneda_incorrectos'],
  [{ currency_id: 'USD' }, 'importe_o_moneda_incorrectos'],
  [{ external_reference: 'invalida' }, 'referencia_invalida'],
]) {
  test(`registra ${JSON.stringify(pago)} sin confirmar el pedido`, async () => {
    const { POST, request, llamadas } = preparar({ pago });
    assert.equal((await POST(request())).status, 200);
    assert.equal(llamadas.rpc.length, 0);
    assert.equal(llamadas.incidencias[0].fila.motivo, motivo);
  });
}
test('registra un pago de pedido inexistente sin violar la referencia a pedidos', async () => {
  const { POST, request, llamadas } = preparar({ pedido: null });
  assert.equal((await POST(request())).status, 200);
  assert.equal(llamadas.incidencias[0].fila.pedido_id, null);
});
test('pide reintento si no se pudo guardar una incidencia', async () => {
  const { POST, request } = preparar({ estado: 'reserva_vencida', incidenteError: new Error('DB') });
  assert.equal((await POST(request())).status, 500);
});
test('un fallo transitorio de confirmación pide reintento', async () => {
  const { POST, request } = preparar({ rpcError: new Error('DB') });
  assert.equal((await POST(request())).status, 500);
});
test('una firma ausente con secreto configurado no consulta pagos ni toca la base', async () => {
  const { POST, request, llamadas } = preparar({ secreto: 'secreto-prueba' });
  assert.equal((await POST(request())).status, 401);
  assert.equal(llamadas.api, 0);
});
test('un cuerpo nulo se rechaza sin lanzar una excepción', async () => {
  const { POST, request } = preparar();
  assert.equal((await POST(request(null))).status, 400);
});
test('los pagos pendientes no confirman ni generan una incidencia de cobro', async () => {
  const { POST, request, llamadas } = preparar({ pago: { status: 'pending' } });
  assert.equal((await POST(request())).status, 200);
  assert.equal(llamadas.rpc.length, 0);
  assert.equal(llamadas.incidencias.length, 0);
});

test('acepta una firma HMAC válida y utiliza el id firmado de la URL', async () => {
  const secreto = 'secreto-prueba';
  const firma = createHmac('sha256', secreto).update('id:456;request-id:solicitud-prueba;ts:1700000000;').digest('hex');
  const { POST, request, llamadas } = preparar({ secreto, pago: { id: 456 } });
  const response = await POST(request({ type: 'payment', data: { id: 999 } }, {
    'x-signature': `ts=1700000000,v1=${firma}`, 'x-request-id': 'solicitud-prueba',
  }, '?data.id=456'));
  assert.equal(response.status, 200);
  assert.deepEqual(llamadas.apiUrls, ['/v1/payments/456']);
  assert.equal(llamadas.rpc[0].args.p_payment_id, '456');
});

for (const firma of ['ts=1,v1=invalida', `ts=1,v1=${'0'.repeat(64)}`, 'v1=abcd']) {
  test(`rechaza una firma alterada o incompleta: ${firma.slice(0, 20)}`, async () => {
    const { POST, request, llamadas } = preparar({ secreto: 'secreto-prueba' });
    assert.equal((await POST(request(undefined, { 'x-signature': firma, 'x-request-id': 'prueba' }))).status, 401);
    assert.equal(llamadas.api, 0);
    assert.equal(llamadas.rpc.length, 0);
  });
}

test('un fallo 503 del proveedor permite reintentar sin tocar pedidos', async () => {
  const { POST, request, llamadas } = preparar({ apiStatus: 503 });
  assert.equal((await POST(request())).status, 500);
  assert.equal(llamadas.rpc.length, 0);
});

test('una respuesta nula del proveedor devuelve un error reintentable', async () => {
  const { POST, request, llamadas } = preparar({ apiBody: null });
  assert.equal((await POST(request())).status, 500);
  assert.equal(llamadas.rpc.length, 0);
});
