import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { cargarTS } from './cargar-ts.mjs';

const Link = ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children);
const Image = ({ src, alt, className }) => React.createElement('img', { src, alt, className });
const prenda = (id, cambios = {}) => ({ id, nombre: id, imagen: '/productos/abrigo.jpg', destacado: true, variantes: [{ stock: 2 }], ...cambios });
async function portada(productos) {
  const { BannerCarousel } = cargarTS('components/BannerCarousel.tsx', {
    react: React, 'react/jsx-runtime': jsxRuntime,
    'next/image': { default: Image }, 'next/link': { default: Link },
  });
  const campaigns = cargarTS('lib/home-campaigns.ts');
  const { HomeHero } = cargarTS('components/HomeHero.tsx', {
    './BannerCarousel': { BannerCarousel }, '@/lib/home-campaigns': campaigns,
    'next/server': { connection: async () => {} },
    'react/jsx-runtime': jsxRuntime,
    '@/lib/productos': { getProductos: async () => productos },
  });
  return renderToStaticMarkup(await HomeHero());
}

test('la portada enlaza a una prenda disponible y omite destacados sin foto o agotados', async () => {
  const html = await portada([prenda('agotado', { variantes: [{ stock: 0 }] }), prenda('sin-foto', { imagen: '' }), prenda('disponible')]);
  assert.match(html, /href="\/productos\/disponible"/);
  assert.doesNotMatch(html, /href="\/productos\/(agotado|sin-foto)"/);
  assert.match(html, /<h1/);
});
test('la portada usa una prenda disponible si no hay destacados', async () => {
  assert.match(await portada([prenda('alternativa', { destacado: false })]), /href="\/productos\/alternativa"/);
});
test('sin stock la portada conserva el acceso al catálogo sin promocionar una prenda agotada', async () => {
  const html = await portada([prenda('agotado', { variantes: [] })]);
  assert.match(html, /href="\/productos"/);
  assert.doesNotMatch(html, /<img|\/productos\/agotado/);
});

test('los filtros móviles empiezan plegados y cuentan solo criterios activos reconocidos', () => {
  const { FiltrosCatalogo } = cargarTS('app/productos/FiltrosCatalogo.tsx', {
    react: React, 'react/jsx-runtime': jsxRuntime,
    'next/navigation': { useRouter: () => ({ replace() {} }), usePathname: () => '/productos',
      useSearchParams: () => new URLSearchParams('categoria=Camisas&talle=M&disponible=0&min=&pagina=1&extra=ignorar') },
    '@/lib/utils': { formatearPrecio: String },
  });
  const html = renderToStaticMarkup(React.createElement(FiltrosCatalogo, {
    conteos: { categoria: { Camisas: 3 }, talle: { M: 3 }, color: {} }, precios: { min: 10, max: 100 },
  }));
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="filtros-catalogo"/);
  assert.match(html, /Filtrar \(2\)/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /Limpiar todo/);
});

test('el tema neón cubre el documento completo, incluido el acceso al panel', () => {
  const Wrapper = ({ children }) => children;
  const { default: RootLayout } = cargarTS('app/layout.tsx', {
    react: React, 'react/jsx-runtime': jsxRuntime,
    'next/font/google': { Geist: () => ({ variable: 'geist' }), Geist_Mono: () => ({ variable: 'mono' }) },
    '@/components/CartProvider': { CartProvider: Wrapper },
    '@/components/StoreChrome': { StoreChrome: Wrapper },
    '@/components/Header': { Header: () => null },
    '@/components/Footer': { Footer: () => null },
    './globals.css': {},
  });
  const html = renderToStaticMarkup(React.createElement(RootLayout, null, 'Acceso al panel'));
  assert.match(html, /<body class="[^"]*street-theme/);
  assert.match(html, /Acceso al panel/);
});

test('la portada prioriza un buzo destacado disponible para la colección streetwear', async () => {
  const html = await portada([prenda('abrigo', { categoria: 'Abrigos' }), prenda('buzo', { categoria: 'Buzos' })]);
  assert.match(html, /href="\/productos\/buzo"/);
});
