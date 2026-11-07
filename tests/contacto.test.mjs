import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTS } from './cargar-ts.mjs';

function preparar({ error = null, lanzar = false } = {}) {
  const insertadas = [];
  const eventos = [];
  const logs = [];
  const { enviarConsulta } = cargarTS('app/contacto/actions.ts', {
    'next/cache': { revalidatePath: (ruta) => eventos.push(ruta) },
    '@/lib/supabase/admin': { createSupabaseAdminClient: () => ({
      from(tabla) {
        assert.equal(tabla, 'consultas');
        return { insert: async (consulta) => {
          eventos.push('insert');
          if (lanzar) throw new Error('Conexión interrumpida');
          if (!error) insertadas.push(consulta);
          return { error };
        } };
      },
    }) },
  }, { console: { error: (...args) => logs.push(args.join(' ')), log: (...args) => logs.push(args.join(' ')) } });
  const form = new FormData();
  for (const [key, value] of Object.entries({
    nombre: '  Prueba  ', email: '  PRUEBA@EXAMPLE.COM ', telefono: ' 123 ',
    asunto: '  Consulta de prueba ', mensaje: ' Primera línea\nSegunda línea ',
  })) form.set(key, value);
  return { enviar: () => enviarConsulta(null, form), form, insertadas, eventos, logs };
}

test('guarda los datos normalizados antes de confirmar la recepción', async () => {
  const { enviar, insertadas, eventos, logs } = preparar();
  assert.ok((await enviar()).ok);
  assert.deepEqual(JSON.parse(JSON.stringify(insertadas)), [{
    nombre: 'Prueba', email: 'prueba@example.com', telefono: '123',
    asunto: 'Consulta de prueba', mensaje: 'Primera línea\nSegunda línea',
  }]);
  assert.deepEqual(eventos, ['insert', '/admin/consultas']);
  assert.deepEqual(logs, []);
});
test('acepta consultas sin teléfono', async () => {
  const { enviar, form, insertadas } = preparar();
  form.delete('telefono');
  assert.ok((await enviar()).ok);
  assert.equal(insertadas[0].telefono, null);
});
for (const opciones of [{ error: { code: '23514', message: 'Datos privados del mensaje' } }, { lanzar: true }]) {
  test(`no anuncia recepción cuando falla el guardado: ${JSON.stringify(opciones)}`, async () => {
    const { enviar, insertadas, eventos, logs } = preparar(opciones);
    assert.match((await enviar()).error, /No pudimos recibir/);
    assert.equal(insertadas.length, 0);
    assert.ok(!eventos.includes('/admin/consultas'));
    assert.ok(logs.every((linea) => !linea.includes('prueba@example') && !linea.includes('Datos privados')));
  });
}
test('el honeypot descarta spam sin guardar datos', async () => {
  const { enviar, form, insertadas, eventos } = preparar();
  form.set('website', 'https://spam.example');
  assert.ok((await enviar()).ok);
  assert.equal(insertadas.length, 0);
  assert.equal(eventos.length, 0);
});
for (const [campo, valor] of [
  ['nombre', ' '], ['email', 'sin-email'], ['asunto', ''], ['mensaje', ''],
  ['nombre', 'a'.repeat(81)], ['email', `${'a'.repeat(110)}@example.com`],
  ['telefono', '1'.repeat(41)], ['asunto', 'a'.repeat(121)], ['mensaje', 'a'.repeat(1001)],
]) {
  test(`rechaza ${campo} inválido o demasiado largo sin truncar ni guardar`, async () => {
    const { enviar, form, insertadas } = preparar();
    form.set(campo, valor);
    assert.ok((await enviar()).error);
    assert.equal(insertadas.length, 0);
  });
}
test('rechaza archivos enviados como campos de texto', async () => {
  const { enviar, form, insertadas } = preparar();
  form.set('telefono', new File(['archivo'], 'telefono.txt'));
  assert.ok((await enviar()).error);
  assert.equal(insertadas.length, 0);
});
