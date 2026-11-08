import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTS } from './cargar-ts.mjs';

const variante = (talle, color, stock = 1) => ({ id: `${talle}-${color}`, talle, color, stock });
const producto = (id, variantes, categoria = 'Remeras', precio = 100) => ({ id, nombre: id, variantes, categoria, precio });
const jsx = (type, props) => ({ type, props });
async function renderizar(productos, params = {}) {
  const ProductCard = () => null;
  const { default: Page } = cargarTS('app/productos/page.tsx', {
    'next/server': { connection: async () => {} },
    react: { Suspense: 'suspense' },
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
    '@/components/ProductCard': { ProductCard },
    '@/lib/productos': { getProductos: async () => productos },
    './FiltrosCatalogo': { FiltrosCatalogo: () => null },
  });
  const page = Page({ searchParams: Promise.resolve(params) });
  const suspense = page.props.children.find((child) => child?.type === 'suspense');
  const nodo = suspense.props.children;
  const result = await nodo.type(nodo.props);
  const ids = [];
  const textos = [];
  function recorrer(n) {
    if (typeof n === 'string' || typeof n === 'number') textos.push(String(n));
    if (Array.isArray(n)) return n.forEach(recorrer);
    if (!n || typeof n !== 'object') return;
    if (n.type === ProductCard) ids.push(n.props.producto.id);
    recorrer(n.props?.children);
  }
  recorrer(result);
  return { ids, textos: textos.join('') };
}

test('talle y color deben existir en la misma variante', async () => {
  const data = [producto('incompatible', [variante('S', 'Negro'), variante('M', 'Blanco')]), producto('correcto', [variante('S', 'Blanco')])];
  assert.deepEqual((await renderizar(data, { talle: 'S', color: 'Blanco' })).ids, ['correcto']);
});
test('solo stock comprueba la variante seleccionada, no otra variante del producto', async () => {
  const data = [producto('agotado', [variante('S', 'Blanco', 0), variante('M', 'Negro', 5)]), producto('disponible', [variante('S', 'Blanco', 1)])];
  const params = { talle: 'S', color: 'Blanco' };
  assert.deepEqual((await renderizar(data, params)).ids, ['agotado', 'disponible']);
  assert.deepEqual((await renderizar(data, { ...params, disponible: '1' })).ids, ['disponible']);
});
test('normaliza mayúsculas y espacios y acepta varias opciones por filtro', async () => {
  const data = [producto('correcto', [variante('M', 'Blanco')]), producto('otro', [variante('L', 'Rojo')])];
  assert.deepEqual((await renderizar(data, { talle: [' s ', ' m '], color: ' negro, BLANCO ' })).ids, ['correcto']);
});
test('mantiene los filtros de categoría y precio', async () => {
  const data = [producto('barato', [variante('S', 'Negro')], 'Remeras', 50), producto('correcto', [variante('S', 'Negro')], 'Remeras', 100), producto('otra-categoria', [variante('S', 'Negro')], 'Abrigos', 100)];
  assert.deepEqual((await renderizar(data, { categoria: 'Remeras', min: '80', max: '120' })).ids, ['correcto']);
});
test('sin filtros conserva el listado completo y no recorta después del producto 50', async () => {
  const data = Array.from({ length: 61 }, (_, index) => producto(`producto-${index}`, [variante('S', 'Negro')]));
  const result = await renderizar(data);
  assert.equal(result.ids.length, 61);
  assert.ok(result.ids.includes('producto-60'));
  assert.match(result.textos, /61 prendas encontradas/);
});
test('una combinación inexistente muestra el estado vacío', async () => {
  const result = await renderizar([producto('prueba', [variante('S', 'Negro')])], { talle: 'XL' });
  assert.deepEqual(result.ids, []);
  assert.match(result.textos, /No hay productos que coincidan/);
});

test('busca nombre y categoría, combina palabras y conserva filtros de stock', async () => {
  const data = [producto('Buzo Norte', [variante('M', 'Negro')], 'Buzos'), producto('Buzo Relax', [variante('M', 'Negro', 0)], 'Buzos'), producto('Jean Norte', [variante('M', 'Azul')], 'Pantalones')];
  assert.deepEqual((await renderizar(data, {q: ' NORTE buzos '})).ids, ['Buzo Norte']);
  assert.deepEqual((await renderizar(data, {q: 'buzos'})).ids, ['Buzo Norte', 'Buzo Relax']);
  assert.deepEqual((await renderizar(data, {q: 'buzos', disponible: '1'})).ids, ['Buzo Norte']);
  assert.deepEqual((await renderizar(data, {q: ['Jean', 'Buzo']})).ids, ['Jean Norte']);
  assert.equal((await renderizar(data, {q: '  '})).ids.length, 3);
  assert.deepEqual((await renderizar(data, {q: 'inexistente'})).ids, []);
});
