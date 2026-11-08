import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { cargarTS } from './cargar-ts.mjs';

async function seccionOfertas(productos) {
  const { default: Home } = cargarTS('app/page.tsx', {
    react: React, 'react/jsx-runtime': jsxRuntime,
    'next/server': { connection: async () => {} },
    'next/link': { default: ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children) },
    '@/components/HomeHero': { HomeHero: () => null },
    '@/components/ProductCarousel': { ProductCarousel: ({ children, label }) => React.createElement('div', { role: 'region', 'aria-label': label }, children) },
    '@/components/ProductCard': { ProductCard: ({ producto }) => React.createElement('a', { href: `/productos/${producto.id}` }, producto.nombre) },
    '@/lib/productos': { getProductos: async () => productos },
    '@/lib/utils': { ENVIO_GRATIS_DESDE: 80000, formatearPrecio: String },
  });
  const sections = React.Children.toArray(Home().props.children).map((el) => el.props?.children);
  const ofertas = sections.find((el) => el?.props?.campo === 'oferta');
  assert.ok(ofertas, 'el home incluye la sección de ofertas');
  return renderToStaticMarkup(await ofertas.type(ofertas.props));
}

test('el inicio muestra los productos en oferta sin exigir que sean destacados', async () => {
  const html = await seccionOfertas([
    { id: 'oferta', nombre: 'Remera en oferta', oferta: true, destacado: false },
    { id: 'normal', nombre: 'Prenda normal', oferta: false, destacado: true },
  ]);
  assert.match(html, /id="ofertas"/);
  assert.match(html, /<h2[^>]*>Ofertas<\/h2>/);
  assert.match(html, /href="\/productos\/oferta"/);
  assert.doesNotMatch(html, /href="\/productos\/normal"/);
  assert.match(html, /aria-label="Prendas en oferta"/);
});

test('sin ofertas el inicio no muestra una sección vacía', async () => {
  assert.equal(await seccionOfertas([{ id: 'normal', oferta: false }]), '');
});
