import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

const builtinRequire = createRequire(import.meta.url);
export function cargarTS(ruta, mocks = {}, globals = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(`../${ruta}`, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  const modulo = { exports: {} };
  vm.runInNewContext(outputText, {
    module: modulo, exports: modulo.exports, FormData, File, Request, Response, Headers, URL, Buffer,
    crypto: globalThis.crypto, AbortController,
    console: { error() {}, warn() {} },
    require: (nombre) => {
      if (nombre in mocks) return mocks[nombre];
      if (nombre.startsWith('node:')) return builtinRequire(nombre);
      throw new Error(`Import no simulado: ${nombre}`);
    },
    ...globals,
  });
  return modulo.exports;
}
