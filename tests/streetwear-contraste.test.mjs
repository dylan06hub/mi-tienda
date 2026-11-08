import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const css = readFileSync(new URL('../app/streetwear.css', import.meta.url), 'utf8');
const colores = Object.fromEntries([...css.matchAll(/--street-([a-z-]+):\s*(#[a-f0-9]{6});/gi)].map((m) => [m[1], m[2]]));
function luminancia(hex) {
  const canales = hex.slice(1).match(/../g).map((c) => parseInt(c, 16) / 255)
    .map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return canales[0] * 0.2126 + canales[1] * 0.7152 + canales[2] * 0.0722;
}
function contraste(a, b) {
  const valores = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (valores[0] + 0.05) / (valores[1] + 0.05);
}

for (const [texto, fondo] of [
  ['foreground', 'background'], ['foreground', 'surface'],
  ['muted', 'background'], ['muted', 'surface'],
  ['on-accent', 'pink'], ['on-accent', 'orange'], ['pink', 'background'], ['orange', 'background'],
  ['on-accent', 'accent'], ['on-accent', 'accent-hover'], ['on-accent', 'secondary'],
]) {
  test(`texto ${texto} sobre ${fondo} cumple contraste AA`, () => {
    const ratio = contraste(colores[texto], colores[fondo]);
    assert.ok(ratio >= 4.5, `Contraste insuficiente: ${ratio.toFixed(2)}:1`);
  });
}
test('el foco cian contrasta con las superficies oscuras', () => {
  for (const fondo of ['background', 'surface']) {
    assert.ok(contraste(colores.secondary, colores[fondo]) >= 3);
  }
});
