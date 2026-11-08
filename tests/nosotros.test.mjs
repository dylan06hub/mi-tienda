import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { cargarTS } from './cargar-ts.mjs';

function find(node, predicate) {
  if (!node || typeof node !== 'object') return;
  if (predicate(node)) return node;
  for (const child of React.Children.toArray(node.props?.children)) {
    const match = find(child, predicate); if (match) return match;
  }
}
test('la cinta queda solo en el home y Nosotros se puede abrir desde el header', () => {
  const Ribbon = () => null;
  for (const path of ['/', '/nosotros', '/productos', '/contacto', '/carrito']) {
    const { Header } = cargarTS('components/Header.tsx', {
      'react/jsx-runtime': jsxRuntime,
      react: { useRef: () => ({current:null}), useState: initial => [initial,()=>{}], useEffect(){} },
      'next/link': {default:'a'}, 'next/navigation': {usePathname:()=>path},
      './AnnouncementRibbon': {AnnouncementRibbon:Ribbon}, './CartProvider': {useCart:()=>({items:[]})},
    });
    const ui=Header();
    assert.equal(!!find(ui, el=>el.type===Ribbon), path==='/');
    assert.equal(find(ui, el=>el.props?.href==='/nosotros').props.children.trim(), 'Nosotros');
  }
});
test('Nosotros incluye galería sin controles, historia de muestra y dos mapas identificados', () => {
  const {default:Page}=cargarTS('app/nosotros/page.tsx', {
    'react/jsx-runtime':jsxRuntime,
    '@/components/HistoryTimeline':{HistoryTimeline:()=>null},
    'next/link':{default:({children,...props})=>React.createElement('a',props,children)},
    'next/image':{default:({src,alt})=>React.createElement('img',{src,alt})},
  });
  const ui=Page(), html=renderToStaticMarkup(ui);
  const gallery=find(ui, el=>el.props?.['aria-label']==='Galería continua de locales ficticios');
  assert.equal(find(gallery,el=>el.type==='button'), undefined);
  assert.equal((html.match(/<iframe/g)||[]).length,2);
  assert.equal((html.match(/Mapa ilustrativo de norte\./g)||[]).length,2);
  assert.match(html,/línea de tiempo ficticia/);
  assert.match(html,/No son locales abiertos al público/);
  for(const name of ['interior','fachada','detalle']) assert.ok(existsSync(new URL(`../public/nosotros/${name}.webp`,import.meta.url)));
});
