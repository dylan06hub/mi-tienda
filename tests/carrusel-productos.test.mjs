import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { cargarTS } from './cargar-ts.mjs';

const find = (element, predicate) => {
  if (!element || typeof element !== 'object') return undefined;
  if (predicate(element)) return element;
  for (const child of React.Children.toArray(element.props?.children)) {
    const match = find(child, predicate);
    if (match) return match;
  }
};

test('el carrusel conserva teclado y contador sin botones y limpia sus escuchas', () => {
  let state, effect, cleanup;
  const listeners = {};
  const calls = [];
  const track = {
    scrollLeft: 0, clientWidth: 232, scrollWidth: 448,
    getBoundingClientRect: () => ({ left: 0, right: 232 }),
    addEventListener: (name, fn) => { listeners[name] = fn; },
    removeEventListener: (name) => { delete listeners[name]; },
    scrollBy(options) {
      calls.push(options);
      this.scrollLeft = Math.max(0, Math.min(216, this.scrollLeft + options.left));
      listeners.scroll();
    },
    scrollTo(options) {
      calls.push(options);
      this.scrollLeft = Math.max(0, Math.min(216, options.left));
      listeners.scroll();
    },
  };
  track.children = Array.from({ length: 4 }, (_, i) => ({ getBoundingClientRect: () => ({ left: i * 116 - track.scrollLeft, right: i * 116 - track.scrollLeft + 100 }) }));
  const { ProductCarousel } = cargarTS('components/ProductCarousel.tsx', {
    'react/jsx-runtime': jsxRuntime,
    react: { useId: () => 'destacados', useRef: () => ({ current: track }), useEffect: (fn) => { effect = fn; }, useState: (initial) => { state = initial; return [initial, (next) => { state = next; }]; } },
  }, {
    ResizeObserver: class { observe() {} disconnect() { cleanup = true; } },
  });
  const ui = ProductCarousel({ children: ['A', 'B', 'C', 'D'] });
  const dispose = effect();
  assert.equal(state.first, 1);
  assert.equal(state.last, 2);
  assert.equal(find(ui, (el) => el.type === "button"), undefined);
  const list = find(ui, (el) => el.type === "ul");
  const target = {};
  const event = { key: "ArrowRight", target, currentTarget: target, preventDefault() {} };
  list.props.onKeyDown(event);
  assert.equal(state.first, 2);
  assert.equal(calls.at(-1).behavior, 'instant');
  list.props.onKeyDown(event);
  assert.equal(state.first, 3);
  assert.equal(state.last, 4);
  assert.equal(calls.at(-1).behavior, 'instant');
  let prevented = false;
  list.props.onKeyDown({ key: 'Home', target, currentTarget: target, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(state.first, 1);
  assert.equal(calls.at(-1).behavior, 'instant');
  dispose();
  assert.equal(cleanup, true);
  assert.equal(Object.keys(listeners).length, 0);
});

test('la tarjeta muestra talles disponibles sin duplicados y conserva el estado agotado', () => {
  const { ProductCard } = cargarTS('components/ProductCard.tsx', {
    'react/jsx-runtime': jsxRuntime,
    'next/link': { default: ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children) },
    'next/image': { default: ({ src, alt }) => React.createElement('img', { src, alt }) },
    '@/lib/utils': { formatearPrecio: (value) => `$ ${value}` },
  });
  const producto = { id: 'buzo', nombre: 'Buzo Norte', categoria: 'Buzos', precio: 62900, imagen: '', variantes: [{ talle: 'M', stock: 3 }, { talle: 'M', stock: 1 }, { talle: 'L', stock: 0 }] };
  const html = renderToStaticMarkup(React.createElement(ProductCard, { producto }));
  assert.match(html, /href="\/productos\/buzo"/);
  assert.match(html, /Talles: M/);
  const card = ProductCard({ producto });
  const photo = find(card, el => el.props?.className?.includes('street-product-image'));
  assert.equal(find(photo, el => el.props?.className === 'street-product-category'), undefined);
  const title = find(card, el => el.type === 'h3');
  const details = React.Children.toArray(card.props.children)[1];
  const fields = React.Children.toArray(details.props.children);
  assert.equal(fields[0].props.children, title.props.children);
  assert.equal(fields[1].props.className, 'street-product-category');
  assert.equal(fields[1].props.children, 'Buzos');
  assert.doesNotMatch(html, /M \/ M|Talles:.*L/);
  const agotado = renderToStaticMarkup(React.createElement(ProductCard, { producto: { ...producto, variantes: [] } }));
  assert.match(agotado, /Agotado/);
  assert.match(agotado, /Sin imagen/);
  const oferta = renderToStaticMarkup(React.createElement(ProductCard, { producto: { ...producto, oferta: true, variantes: [] } }));
  assert.match(oferta, />Oferta</);
  assert.match(oferta, /Agotado/);
  assert.match(oferta, /\$ 62900/);
  assert.doesNotMatch(oferta, /<del|%/);
  assert.doesNotMatch(html, />Oferta</);
});
