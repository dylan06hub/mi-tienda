import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTS } from './cargar-ts.mjs';

const item = (cantidad, productoId = 'producto') => ({ productoId, varianteId: 's', cantidad });
const jsx = (type, props) => ({ type, props });
const comparar = (actual, esperado) => assert.deepEqual(JSON.parse(JSON.stringify(actual)), esperado);
function iniciar(storage = new Map([['norte-carrito', JSON.stringify([item(3)])]])) {
  const utils = cargarTS('lib/utils.ts');
  const carrito = cargarTS('lib/carrito.ts');
  const { CartProvider } = cargarTS('components/CartProvider.tsx', {
    '@/lib/utils': utils, '@/lib/carrito': carrito,
    'react/jsx-runtime': { jsx },
    react: {
      createContext: () => ({ Provider: 'Provider' }),
      useCallback: (fn) => fn,
      useState: (valor) => [typeof valor === 'function' ? valor() : valor, () => {}],
      useEffect() {},
      useSyncExternalStore: (subscribe, getSnapshot) => getSnapshot(),
    },
  }, {
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    navigator: { locks: { request: async (key, fn) => fn() } },
  });
  return { cart: () => CartProvider({ children: null }).props.value, storage };
}

test('descuenta solo las cantidades compradas y conserva otros artículos', async () => {
  const { cart } = iniciar();
  await cart().registrarPedido('pedido', [item(3)]);
  await cart().agregar(item(2));
  await cart().agregar(item(1, 'otro'));
  await cart().aplicarPedido('pedido', [item(3)]);
  comparar(cart().items, [item(2), item(1, 'otro')]);
});
test('recargar un resultado pagado no vuelve a descontar una compra', async () => {
  const { cart, storage } = iniciar();
  await cart().registrarPedido('pedido', [item(3)]);
  await cart().aplicarPedido('pedido', [item(3)]);
  await cart().agregar(item(2));
  const recargado = iniciar(storage);
  await recargado.cart().aplicarPedido('pedido', [item(3)]);
  comparar(recargado.cart().items, [item(2)]);
});
test('un enlace abierto en otro navegador no limpia su carrito', async () => {
  const { cart } = iniciar();
  await cart().aplicarPedido('pedido-ajeno', [item(3)]);
  comparar(cart().items, [item(3)]);
});
test('quitar y volver a agregar una variante durante el pago conserva los artículos nuevos', async () => {
  const { cart } = iniciar();
  await cart().registrarPedido('pedido', [item(3)]);
  await cart().quitar('producto', 's');
  await cart().agregar(item(2));
  await cart().aplicarPedido('pedido', [item(3)]);
  comparar(cart().items, [item(2)]);
});
test('reducir y después aumentar cantidades conserva lo agregado después', async () => {
  const { cart } = iniciar();
  await cart().registrarPedido('pedido', [item(3)]);
  await cart().cambiarCantidad('producto', 's', 1);
  await cart().agregar(item(2));
  await cart().aplicarPedido('pedido', [item(3)]);
  comparar(cart().items, [item(2)]);
});
test('migra el carrito antiguo y persiste marcadores e items en una sola escritura', async () => {
  const { cart, storage } = iniciar();
  await cart().registrarPedido('pedido', [item(3)]);
  await cart().aplicarPedido('pedido', [item(3)]);
  const datos = JSON.parse(storage.get('norte-carrito'));
  assert.deepEqual(datos.items, []);
  assert.deepEqual(datos.pedidosAplicados, ['pedido']);
  assert.deepEqual(datos.comprasPendientes, {});
});

test('dos compras del mismo carrito no descuentan después artículos nuevos', async () => {
  const { cart } = iniciar();
  await cart().registrarPedido('primero', [item(3)]);
  await cart().registrarPedido('segundo', [item(3)]);
  await cart().aplicarPedido('primero', [item(3)]);
  await cart().agregar(item(2));
  await cart().aplicarPedido('segundo', [item(3)]);
  comparar(cart().items, [item(2)]);
});
