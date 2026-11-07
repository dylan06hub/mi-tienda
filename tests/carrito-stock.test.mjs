import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTS } from './cargar-ts.mjs';

for (const stock of [0, 1]) {
  test(`validar el carrito conserva sus cantidades aunque el stock disponible sea ${stock}`, async () => {
    const { POST } = cargarTS('app/api/carrito/route.ts', {
      'next/server': { NextResponse: { json: (data, init) => Response.json(data, init) } },
      '@/lib/utils': { costeEnvio: () => 4995 },
      '@/lib/productos': {
        normalizarIdProducto: (id) => id,
        getProductos: async () => [{ id: 'producto', nombre: 'Prueba', precio: 100, imagen: '', categoria: 'Prueba', variantes: [{ id: 's', talle: 'S', color: 'Negro', stock }] }],
      },
    });
    const response = await POST(new Request('http://localhost/api/carrito', {
      method: 'POST', body: JSON.stringify({ items: [{ productoId: 'producto', varianteId: 's', cantidad: 3 }] }),
    }));
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.items[0].cantidad, 3);
    assert.equal(data.lineas[0].variante.stock, stock);
    assert.equal(data.total, 5295);
  });
}
