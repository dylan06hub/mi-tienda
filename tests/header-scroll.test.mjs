import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as jsxRuntime from 'react/jsx-runtime';
import { cargarTS } from './cargar-ts.mjs';

test('el header se oculta al bajar, vuelve al subir e ignora pequeños movimientos', () => {
  let state, effect, listener, disposed;
  const win = {
    scrollY: 0,
    addEventListener(name, fn, options) { assert.equal(name, 'scroll'); assert.equal(options.passive, true); listener = fn; },
    removeEventListener(name, fn) { assert.equal(name, 'scroll'); assert.equal(fn, listener); disposed = true; },
  };
  const { Header } = cargarTS('components/Header.tsx', {
    'react/jsx-runtime': jsxRuntime,
    react: {
      useRef: () => ({ current: { offsetHeight: 96 } }),
      useState: initial => { state = initial; return [state, next => { state = next; }]; },
      useEffect: fn => { effect = fn; },
    },
    'next/link': { default: () => null },
    'next/navigation': { usePathname: () => '/' },
    './AnnouncementRibbon': { AnnouncementRibbon: () => null },
    './CartProvider': { useCart: () => ({ items: [] }) },
  }, { window: win });
  Header();
  const cleanup = effect();
  const scroll = y => { win.scrollY = y; listener(); };
  scroll(50); assert.equal(state, false);
  scroll(150); assert.equal(state, true);
  scroll(147); assert.equal(state, true);
  scroll(138); assert.equal(state, false);
  scroll(140); assert.equal(state, false);
  scroll(170); assert.equal(state, true);
  scroll(0); assert.equal(state, false);
  scroll(-20); assert.equal(state, false);
  cleanup(); assert.equal(disposed, true);
});
