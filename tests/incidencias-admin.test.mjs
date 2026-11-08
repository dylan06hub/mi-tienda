import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTS } from './cargar-ts.mjs';

function preparar(autorizado = true) {
  const escrituras = [];
  const { resolverIncidenciaPago } = cargarTS('app/admin/(panel)/pedidos/actions.ts', {
    'next/cache': { revalidatePath() {} },
    'next/navigation': { redirect() {} },
    '@/lib/admin-auth': { requireAdmin: async () => { if (!autorizado) throw new Error('NO_AUTORIZADO'); } },
    '@/lib/supabase/admin': { createSupabaseAdminClient: () => ({ from: (tabla) => ({
      update(datos) { escrituras.push({ tabla, datos }); return this; },
      eq(campo, valor) { escrituras[0].filtro = [campo, valor]; return this; },
      is: async (campo, valor) => { assert.equal(campo, 'resuelta_en'); assert.equal(valor, null); return { error: null }; },
    }) }) },
  });
  const form = new FormData();
  form.set('pago_id', '123');
  form.set('resolucion', 'Reembolso comprobado en Mercado Pago');
  return { resolver: () => resolverIncidenciaPago(form), form, escrituras };
}
test('registra la resolución únicamente en la incidencia indicada', async () => {
  const { resolver, escrituras } = preparar();
  await resolver();
  assert.equal(escrituras[0].tabla, 'incidencias_pago');
  assert.deepEqual(escrituras[0].filtro, ['mp_payment_id', '123']);
  assert.ok(escrituras[0].datos.resuelta_en);
});
test('no permite resolver incidencias sin ser administrador', async () => {
  const { resolver, escrituras } = preparar(false);
  await assert.rejects(resolver(), /NO_AUTORIZADO/);
  assert.equal(escrituras.length, 0);
});
test('exige una nota de resolución válida', async () => {
  for (const valor of ['', ' ', 'x'.repeat(501)]) {
    const { resolver, form, escrituras } = preparar();
    form.set('resolucion', valor);
    await assert.rejects(resolver(), /resolución/);
    assert.equal(escrituras.length, 0);
  }
});
