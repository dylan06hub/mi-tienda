import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { cargarTS } from './cargar-ts.mjs';

const Link = ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children);
const Image = ({ src, alt }) => React.createElement('img', { src, alt });
const base = { 'react/jsx-runtime': jsxRuntime, 'next/link': { default: Link }, 'next/image': { default: Image } };
const productos = [
  { id: 'camisa', nombre: 'Camisa Azul', categoria: 'Camisas', precio: 50000, activo: true, destacado: false, imagen: '', variantes: [{ stock: 2 }] },
  { id: 'remera', nombre: 'Remera Blanca', categoria: 'Remeras', precio: 30000, activo: false, destacado: false, imagen: '', variantes: [{ stock: 0 }] },
];

for (const [path, actual] of [['/admin', 'Resumen'], ['/admin/productos/nuevo', 'Productos'], ['/admin/pedidos/123', 'Pedidos']]) {
  test(`la navegación identifica la sección de ${path}`, () => {
    const { AdminNav } = cargarTS('app/admin/(panel)/AdminNav.tsx', { ...base, 'next/navigation': { usePathname: () => path } });
    const html = renderToStaticMarkup(React.createElement(AdminNav));
    assert.equal((html.match(/aria-current="page"/g) ?? []).length, 1);
    assert.match(html, new RegExp(`aria-current="page"[^>]*>${actual}</a>`));
  });
}

async function listado(params = {}, autorizado = true) {
  const { default: Page } = cargarTS('app/admin/(panel)/productos/page.tsx', {
    ...base,
    '@/lib/admin-auth': { requireAdmin: async () => { if (!autorizado) throw Error('NO_ADMIN'); } },
    '@/lib/productos': { getProductosAdmin: async () => { assert.ok(autorizado); return productos; } },
    '@/lib/utils': { formatearPrecio: String },
  });
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve(params) }));
}

test('productos combina búsqueda, categoría y estado y permite limpiar sin borrar', async () => {
  const html = await listado({ q: 'camisa', categoria: 'Camisas', estado: 'publicados' });
  assert.match(html, /Camisa Azul/);
  assert.doesNotMatch(html, /Remera Blanca|Eliminar/);
  assert.match(html, /Limpiar filtros/);
});
test('productos permite encontrar ocultos sin stock', async () => {
  const html = await listado({ estado: 'sin-stock' });
  assert.match(html, /Remera Blanca/);
  assert.doesNotMatch(html, /Camisa Azul/);
});
test('productos muestra recuperación ante una búsqueda sin coincidencias', async () => {
  assert.match(await listado({ q: 'inexistente' }), /No encontramos productos/);
});
test('productos exige autorización antes de consultar los datos', async () => {
  await assert.rejects(listado({}, false), /NO_ADMIN/);
});

test('el formulario separa datos, talles y publicación y protege la última combinación', () => {
  const { ProductoForm } = cargarTS('app/admin/(panel)/productos/ProductoForm.tsx', {
    ...base, react: React, './actions': { guardarProducto: async () => null },
  });
  const html = renderToStaticMarkup(React.createElement(ProductoForm, { categorias: ['Camisas'] }));
  assert.match(html, /Datos de la prenda/);
  assert.match(html, /Talles, colores y stock/);
  assert.match(html, /Dónde se muestra/);
  assert.match(html, /aria-label="Quitar variante 1" disabled=""/);
  assert.match(html, /<option value="Camisas"/);
});

test('la edición mantiene la copia original y permite ajustar stock sin renombrar variantes vendidas', () => {
  const { ProductoForm } = cargarTS('app/admin/(panel)/productos/ProductoForm.tsx', {
    ...base, react: React, './actions': { guardarProducto: async () => null },
  });
  const producto = { ...productos[0], variantes: [{ id: 'm-azul', talle: 'M', color: 'Azul', stock: 2 }] };
  const html = renderToStaticMarkup(React.createElement(ProductoForm, { producto }));
  assert.match(html, /name="variantes_originales"/);
  assert.match(html.match(/<input[^>]+name="variante_talle"[^>]*>/)?.[0] ?? "", /readOnly=""/);
  assert.match(html.match(/<input[^>]+name="variante_stock"[^>]*>/)?.[0] ?? "", /type="number"/);
  assert.match(html, /Guardar cambios/);
});

for (const [path, oculto] of [['/admin', true], ['/admin/productos/nuevo', true], ['/productos', false], ['/administracion', false]]) {
  test(`la navegación pública se distingue del panel en ${path}`, () => {
    const { StoreChrome } = cargarTS('components/StoreChrome.tsx', { 'next/navigation': { usePathname: () => path } });
    assert.equal(StoreChrome({ children: 'tienda' }), oculto ? null : 'tienda');
  });
}

const pedidos = [
  { id: 'pendiente-1', nombre: 'Cliente uno', email: 'uno@example.com', estado: 'pendiente', total: 100, creadoEn: '2026-11-01' },
  { id: 'pagado-2', nombre: 'Cliente dos', email: 'dos@example.com', estado: 'pagado', total: 200, creadoEn: '2026-11-02' },
];
const incidencias = [
  { mp_payment_id: 'pago-pendiente', motivo: 'stock_insuficiente', creado_en: '2026-11-01', resuelta_en: null },
  { mp_payment_id: 'pago-resuelto', motivo: 'pago_duplicado', creado_en: '2026-11-01', resuelta_en: '2026-11-02', resolucion: 'Reembolso comprobado' },
];
const datosPedidos = {
  ...base, '@/lib/admin-auth': { requireAdmin: async () => ({ email: 'admin@example.com' }) },
  '@/lib/pedidos': { getPedidosAdmin: async () => pedidos, getIncidenciasPago: async () => incidencias },
  '@/lib/utils': { formatearPrecio: String, formatearFecha: String },
  './EstadoPedidoBadge': { EstadoPedidoBadge: ({ estado }) => estado },
  './actions': { resolverIncidenciaPago: async () => {} },
};
test('pedidos combina estado y búsqueda sin esconder las incidencias pendientes ni su historial', async () => {
  const { default: Page } = cargarTS('app/admin/(panel)/pedidos/page.tsx', datosPedidos);
  const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ q: 'dos', estado: 'pagado' }) }));
  assert.match(html, /Cliente dos/);
  assert.doesNotMatch(html, /Cliente uno/);
  assert.match(html, /pago-pendiente/);
  assert.match(html, /pago-resuelto/);
  assert.match(html, /Reembolso comprobado/);
});

test('el resumen distingue pedidos por enviar, productos agotados y pagos pendientes', async () => {
  const { default: Page } = cargarTS('app/admin/(panel)/page.tsx', {
    ...datosPedidos,
    '@/lib/productos': { getProductosAdmin: async () => productos },
    '@/lib/consultas': { getConsultasAdmin: async () => [] },
    './pedidos/EstadoPedidoBadge': { EstadoPedidoBadge: ({ estado }) => estado },
  });
  const html = renderToStaticMarkup(await Page());
  assert.match(html, /href="\/admin\/pedidos\?estado=pagado"[^]*?Pedidos pagados por enviar[^]*?>1<\/span>/);
  assert.match(html, /Pagos que necesitan revisión[^]*?>1<\/span>/);
  assert.match(html, /Productos sin stock[^]*?>1<\/span>/);
});

test('consultas busca en el mensaje y ofrece responder sin exponer HTML del usuario', async () => {
  const { default: Page } = cargarTS('app/admin/(panel)/consultas/page.tsx', {
    ...base,
    '@/lib/admin-auth': { requireAdmin: async () => ({}) },
    '@/lib/consultas': { getConsultasAdmin: async () => [
      { id: '1', nombre: 'Cliente', email: 'cliente@example.com', asunto: 'Un talle', mensaje: 'Necesito talle XL <script>alert(1)</script>', creado_en: '2026-11-01' },
      { id: '2', nombre: 'Otra consulta', email: 'otra@example.com', asunto: 'Un color', mensaje: 'Consulta de color', creado_en: '2026-11-01' },
    ] },
    '@/lib/utils': { formatearFecha: String },
  });
  const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ q: 'XL' }) }));
  assert.match(html, /Un talle/);
  assert.doesNotMatch(html, /Otra consulta|<script>/);
  assert.match(html, /Responder por email/);
  assert.match(html, /cliente%40example.com\?subject=Re%3A/);
});
