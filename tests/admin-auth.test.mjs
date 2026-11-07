import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const { outputText } = ts.transpileModule(
  readFileSync(new URL('../lib/admin-auth.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
);

function cargar({ user = { id: 'admin-prueba', email: 'prueba@example.com' }, authError = null, admin = true, adminError = null } = {}) {
  const pasos = [];
  const modules = {
    'server-only': {},
    react: { cache: (fn) => fn },
    'next/server': { connection: async () => { pasos.push('peticion'); } },
    'next/navigation': { redirect: (url) => { throw new Error(`REDIRECT:${url}`); } },
    '@/lib/supabase/server': { createSupabaseServerClient: async () => {
      assert.deepEqual(pasos, ['peticion'], 'La autenticación debe esperar a una petición real');
      pasos.push('supabase');
      return {
        auth: { getUser: async () => ({ data: { user }, error: authError }) },
        rpc: async (nombre) => {
          assert.equal(nombre, 'is_admin');
          pasos.push('permisos');
          return { data: admin, error: adminError };
        },
      };
    } },
  };
  const moduloAuth = { exports: {} };
  vm.runInNewContext(outputText, {
    module: moduloAuth, exports: moduloAuth.exports,
    require: (name) => { assert.ok(name in modules, `Import inesperado: ${name}`); return modules[name]; },
  });
  return { ...moduloAuth.exports, pasos };
}

test('la autenticación ocurre durante la petición y conserva el control de administrador', async () => {
  const { getAdminUser, pasos } = cargar();
  const user = await getAdminUser();
  assert.equal(user.id, 'admin-prueba');
  assert.deepEqual(pasos, ['peticion', 'supabase', 'permisos']);
});

for (const [nombre, opciones] of [
  ['sin sesión', { user: null }],
  ['error de autenticación', { authError: new Error('Sesión inválida') }],
  ['usuario sin permisos', { admin: false }],
  ['error al consultar permisos', { adminError: new Error('Consulta fallida') }],
]) {
  test(`el panel sigue rechazando ${nombre}`, async () => {
    const { requireAdmin } = cargar(opciones);
    await assert.rejects(requireAdmin(), /REDIRECT:\/admin\/login/);
  });
}
