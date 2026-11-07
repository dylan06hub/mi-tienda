import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTS } from './cargar-ts.mjs';

const jsx = (type, props) => ({ type, props });
test('la bandeja exige autorización antes de leer consultas', async () => {
  let lecturas = 0;
  const { default: Page } = cargarTS('app/admin/(panel)/consultas/page.tsx', {
    'next/link': { default: 'link', __esModule: true },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    '@/lib/admin-auth': { requireAdmin: async () => { throw new Error('NO_AUTORIZADO'); } },
    '@/lib/consultas': { getConsultasAdmin: async () => { lecturas++; return []; } },
    '@/lib/utils': { formatearFecha: (value) => value },
  });
  await assert.rejects(Page({ searchParams: Promise.resolve({}) }), /NO_AUTORIZADO/);
  assert.equal(lecturas, 0);
});
test('consulta con la sesión del usuario y ordena por las más recientes', async () => {
  const { getConsultasAdmin } = cargarTS('lib/consultas.ts', {
    'server-only': {},
    '@/lib/supabase/server': { createSupabaseServerClient: async () => ({ from(tabla) {
      assert.equal(tabla, 'consultas');
      return { select() { return this; }, order: async (campo, opciones) => {
        assert.equal(campo, 'creado_en');
        assert.equal(opciones.ascending, false);
        return { data: [{ asunto: 'Prueba' }], error: null };
      } };
    } }) },
  });
  assert.equal((await getConsultasAdmin())[0].asunto, 'Prueba');
});
test('un error de lectura no se presenta como una bandeja vacía', async () => {
  const { getConsultasAdmin } = cargarTS('lib/consultas.ts', {
    'server-only': {},
    '@/lib/supabase/server': { createSupabaseServerClient: async () => ({ from: () => ({
      select() { return this; }, order: async () => ({ error: { message: 'Error' }, data: null }),
    }) }) },
  });
  await assert.rejects(getConsultasAdmin(), /No se pudieron cargar/);
});
