import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../app/admin/(panel)/productos/actions.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const original = [{ id: 's-negro', talle: 'S', color: 'Negro', stock: 10 }];

function preparar({ error = null, autorizado = true, limpiezaFalla = false, nuevo = false } = {}) {
  const llamadas = { rpc: [], borradas: [], revalidadas: [], auth: 0 };
  const storage = {
    async upload() { return { error: null }; },
    getPublicUrl(ruta) { return { data: { publicUrl: `https://imagenes.example/${ruta}` } }; },
    async remove(rutas) {
      llamadas.borradas.push(...rutas);
      if (limpiezaFalla) throw new Error('Storage no disponible');
      return { error: null };
    },
  };
  const supabase = {
    from(tabla) {
      assert.ok(['productos', 'variantes'].includes(tabla));
      return {
        select() { return this; },
        eq() { return this; },
        async maybeSingle() { return { data: nuevo ? null : { id: 'prueba', imagen: '/anterior.jpg' }, error: null }; },
        then(resolve, reject) { return Promise.resolve({ data: nuevo ? [] : original, error: null }).then(resolve, reject); },
      };
    },
    async rpc(nombre, datos) { llamadas.rpc.push({ nombre, datos }); return { error }; },
  };
  const modules = {
    'next/cache': { revalidatePath: (ruta) => llamadas.revalidadas.push(ruta) },
    'next/navigation': { redirect: (ruta) => { throw new Error(`REDIRECT:${ruta}`); } },
    '@/lib/admin-auth': { requireAdmin: async () => {
      llamadas.auth++;
      if (!autorizado) throw new Error('NO_AUTORIZADO');
    } },
    '@/lib/supabase/admin': { createSupabaseAdminClient: () => ({ storage: { from: () => storage } }) },
    '@/lib/supabase/server': { createSupabaseServerClient: async () => supabase },
  };
  const moduloAcciones = { exports: {} };
  vm.runInNewContext(outputText, {
    module: moduloAcciones, exports: moduloAcciones.exports, crypto: globalThis.crypto,
    console: { error() {} },
    require: (nombre) => { assert.ok(nombre in modules, `Import inesperado: ${nombre}`); return modules[nombre]; },
  });
  const form = new FormData();
  for (const [key, value] of Object.entries({
    id: 'prueba', nombre: 'Prueba', categoria: 'Ropa', precio: '100',
    activo: 'on', variantes_originales: JSON.stringify(original),
    variante_id: 's-negro', variante_talle: 'S', variante_color: 'Negro', variante_stock: '10',
  })) form.set(key, value);
  if (nuevo) {
    form.delete('id');
    form.set('variante_id', '');
    form.set('variantes_originales', '[]');
  }
  form.set('imagen_archivo', new File(['imagen de prueba'], 'prueba.png', { type: 'image/png' }));
  return { guardar: () => moduloAcciones.exports.guardarProducto(null, form), form, llamadas };
}

test('guarda mediante una sola RPC y envía la copia original de las variantes', async () => {
  const { guardar, llamadas } = preparar();
  await assert.rejects(guardar(), /REDIRECT:\/admin\/productos/);
  assert.equal(llamadas.rpc.length, 1);
  const { nombre, datos } = llamadas.rpc[0];
  assert.equal(nombre, 'guardar_producto');
  assert.deepEqual(JSON.parse(JSON.stringify(datos.p_originales)), original);
  assert.equal(datos.p_nuevo, false);
  assert.equal(datos.p_variantes[0].id, 's-negro');
  assert.equal(llamadas.borradas.length, 0);
  assert.ok(llamadas.revalidadas.includes('/productos/prueba'));
});

test('exige autorización antes de guardar', async () => {
  const { guardar, llamadas } = preparar({ autorizado: false });
  await assert.rejects(guardar(), /NO_AUTORIZADO/);
  assert.equal(llamadas.rpc.length, 0);
});

test('crea un producto nuevo con id de variante nuevo y sin copia previa', async () => {
  const { guardar, llamadas } = preparar({ nuevo: true });
  await assert.rejects(guardar(), /REDIRECT:\/admin\/productos/);
  const { datos } = llamadas.rpc[0];
  assert.equal(datos.p_nuevo, true);
  assert.equal(datos.p_id, 'prueba');
  assert.equal(datos.p_originales.length, 0);
  assert.match(datos.p_variantes[0].id, /^[0-9a-f-]{36}$/);
});

test('rechaza una copia original inválida antes de llamar a la base', async () => {
  for (const valor of ['', '{', '{}', 'null']) {
    const { guardar, form, llamadas } = preparar();
    form.set('variantes_originales', valor);
    assert.match((await guardar()).error, /Recargá/);
    assert.equal(llamadas.rpc.length, 0);
  }
});

test('un conflicto de stock pide recargar y limpia la imagen nueva', async () => {
  const { guardar, llamadas } = preparar({ error: { code: 'P0001', message: 'VARIANTES_DESACTUALIZADAS' } });
  assert.match((await guardar()).error, /stock.*Recargá/);
  assert.equal(llamadas.borradas.length, 1);
  assert.equal(llamadas.revalidadas.length, 0);
});

for (const code of ['23503', '23001']) {
  test(`la protección de pedidos (${code}) conserva el mensaje y revierte la imagen`, async () => {
    const { guardar, llamadas } = preparar({ error: { code, message: 'foreign key' } });
    assert.match((await guardar()).error, /pedidos asociados.*No se guardaron cambios/);
    assert.equal(llamadas.borradas.length, 1);
  });
}

for (const code of ['', '08006', '40003']) {
  test(`un resultado incierto (${code || 'red'}) conserva la imagen`, async () => {
    const { guardar, llamadas } = preparar({ error: { code, message: 'Conexión interrumpida' } });
    assert.match((await guardar()).error, /No se pudo confirmar/);
    assert.equal(llamadas.borradas.length, 0);
  });
}

test('si falla la limpieza de Storage, sigue mostrando el conflicto original', async () => {
  const { guardar } = preparar({ error: { code: 'P0001', message: 'VARIANTES_DESACTUALIZADAS' }, limpiezaFalla: true });
  assert.match((await guardar()).error, /stock.*Recargá/);
});
