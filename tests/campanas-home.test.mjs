import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { cargarTS } from './cargar-ts.mjs';

const { getHomeCampaigns } = cargarTS('lib/home-campaigns.ts');
const producto = (id, extra = {}) => ({ id, nombre: id, categoria: 'Buzos', imagen: '/buzo.jpg', destacado: true, oferta: false, variantes: [{ stock: 1 }], ...extra });

test('las cuatro campañas usan productos disponibles y las ofertas se enlazan solo si existen', () => {
  const agotado = producto('agotado', { oferta: true, variantes: [{ stock: 0 }] });
  const sinOfertas = getHomeCampaigns([agotado, producto('buzo')]);
  assert.equal(sinOfertas.length, 4);
  assert.equal(new Set(sinOfertas.map((p) => p.id)).size, 4);
  assert.equal(sinOfertas.find((p) => p.id === 'ofertas').href, '/productos');
  assert.ok(sinOfertas.every((p) => p.product?.id !== 'agotado'));
  const ofertas = getHomeCampaigns([producto('buzo'), producto('oferta', { oferta: true })]);
  assert.equal(ofertas[1].href, '/#ofertas');
  assert.equal(ofertas[1].product.id, 'oferta');
  assert.equal(ofertas[2].href, '/#ofertas');
  assert.equal(ofertas[2].product.id, 'oferta');
  const sinFoto = getHomeCampaigns([producto("sin-foto", { imagen: "", oferta: true })]);
  assert.equal(sinFoto[1].href, "/#ofertas");
  assert.equal(sinFoto[1].product, null);
  const vacias = getHomeCampaigns([]);
  assert.ok(vacias.every((p) => p.product === null));
  assert.equal(vacias[3].href, "/productos");
});

function find(element, predicate) {
  if (!element || typeof element !== 'object') return;
  if (predicate(element)) return element;
  for (const child of React.Children.toArray(element.props?.children)) {
    const match = find(child, predicate);
    if (match) return match;
  }
}

test('los banners rotan, se pausan al interactuar y respetan movimiento reducido y pestaña oculta', () => {
  const values = [];
  let cursor, effects, tick, stopped = false;
  const { BannerCarousel } = cargarTS('components/BannerCarousel.tsx', {
    'react/jsx-runtime': jsxRuntime,
    react: { useId: () => 'banner', useRef: () => ({ current: null }), useEffect: (fn) => effects.push(fn), useState: (initial) => {
      const key = cursor++;
      if (!(key in values)) values[key] = initial;
      return [values[key], (next) => { values[key] = typeof next === 'function' ? next(values[key]) : next; }];
    } },
    'next/image': { default: () => null }, 'next/link': { default: 'a' },
  }, { window: { setInterval: (fn) => { tick = fn; return 1; }, clearInterval: () => { stopped = true; } } });
  const banners = getHomeCampaigns([producto('buzo')]);
  function render() { cursor = 0; effects = []; return BannerCarousel({ banners }); }
  render();
  assert.equal(effects[1](), undefined, 'inicia sin rotación hasta conocer la preferencia de movimiento');
  values[3] = false;
  render();
  const cleanup = effects[1]();
  tick();
  assert.equal(values[0], 1);
  cleanup();
  assert.equal(stopped, true);
  let ui = render();
  find(ui, (el) => el.props?.['aria-label'] === 'Banner siguiente').props.onClick();
  assert.equal(values[0], 2);
  render();
  assert.equal(effects[1](), undefined, 'la navegación manual pausa la rotación');
  values[1] = false;
  values[4] = false;
  render();
  assert.equal(effects[1](), undefined, 'no rota en una pestaña oculta');
  values[4] = true;
  ui = render();
  ui.props.onFocusCapture();
  render();
  assert.equal(effects[1](), undefined, 'el foco de teclado pausa la rotación');
  ui = render();
  const slide = find(ui, (el) => el.props?.onPointerDown);
  slide.props.onPointerDown({ pointerType: 'touch', clientX: 150, clientY: 20 });
  slide.props.onPointerUp({ pointerType: 'touch', clientX: 30, clientY: 25 });
  assert.equal(values[0], 3, 'un deslizamiento horizontal pasa al banner siguiente');
  let prevented = false;
  ui.props.onClickCapture({ detail: 1, preventDefault() { prevented = true; }, stopPropagation() {} });
  assert.equal(prevented, true, 'deslizar no abre accidentalmente el enlace de una prenda');
});

test('el footer enlaza a redes y Maps e identifica la ubicación ficticia', () => {
  const { Footer } = cargarTS('components/Footer.tsx', {
    'react/jsx-runtime': jsxRuntime,
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
  });
  const html = renderToStaticMarkup(React.createElement(Footer));
  for (const domain of ['instagram.com', 'tiktok.com', 'facebook.com', 'google.com/maps']) assert.ok(html.includes(domain));
  assert.match(html, /Ubicación de muestra/);
  assert.match(html, /Mercado Pago/);
  assert.match(html, /noopener noreferrer/);
});
