## Reservas y pagos (fase 2)

Después de `checkout.sql`, aplicar `supabase/reservas.sql` y
`supabase/reservas-cron.sql` antes de desplegar esta versión de la aplicación.
El segundo archivo habilita pg_cron en Supabase y programa la devolución de
reservas vencidas cada minuto. Los pedidos anteriores mantienen su confirmación
sin reserva; no se altera su stock al migrar.

- Un checkout descuenta las unidades disponibles y las reserva por 30 minutos.
  La preferencia de Mercado Pago vence al mismo tiempo. Confirmar el pago no
  vuelve a descontar. Cancelar o vencer devuelve las unidades una sola vez.
- Los pagos aprobados después del vencimiento o la cancelación, los pagos extra
  y los importes incorrectos quedan en **Administración → Pedidos → Revisión de pagos**.
  Los reembolsos se hacen en Mercado Pago; luego se registra su resolución en el panel.
  Una notificación duplicada no reabre una incidencia ya resuelta.
- El resultado del pago exige el enlace privado del pedido y consulta su estado
  real. Solo un pedido pagado/enviado puede retirar del carrito las cantidades
  registradas al iniciar esa compra, una sola vez y en el mismo navegador.
  Un carrito sin stock conserva sus cantidades para que el comprador las revise.
- Los pagos pendientes pueden aprobarse después de la reserva; en ese caso quedan
  para revisión y posible reembolso. La expiración de la preferencia no equivale
  a cancelar un pago ya iniciado. Una notificación que llega cuando la reserva
  ya fue liberada también requiere revisión, aunque el pago se aprobara antes.
- Ante un fallo al crear la preferencia se cancela el pedido y libera la reserva.
  El pedido se conserva para poder identificar cualquier pago tardío.

Pruebas (base aislada con las migraciones instaladas; nunca una base de producción):

```sh
npm test
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/reservas.sql
PGDATABASE="$TEST_DATABASE_URL" python3 supabase/tests/reservas-concurrencia.py
```

La prueba de concurrencia crea datos temporales y los retira al finalizar.
Ver configuración oficial de [vigencia de preferencias de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro-preferences/additional-settings/term-of-preference)
y [Supabase Cron](https://supabase.com/docs/guides/cron).

## Guardado de productos (fase 1)

Antes de desplegar esta versión, ejecutar `supabase/productos.sql` en el SQL
Editor de Supabase, después de `schema.sql` y `sections.sql`. Es idempotente y
no modifica datos existentes. Agrega `guardar_producto`, que guarda producto
y variantes en una transacción usando la sesión y las políticas del administrador.
Si el stock o las variantes cambiaron desde que se abrió el formulario, rechaza
el guardado y pide recargar. Las variantes con pedidos siguen protegidas.

Pruebas de la acción del servidor, con autorización, base de datos y Storage
simulados (no escriben en Supabase):

```sh
npm test
```

Pruebas SQL (solo en una base de prueba con el esquema y la función instalados):

```sh
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/productos.sql
```

Las pruebas revierten sus fixtures al terminar. Cubren altas y ediciones,
rollback ante errores, stock desactualizado, eliminación de variantes y permisos.
La subida de imágenes ocurre antes de la transacción; se limpia si SQL rechaza
el guardado. Ante una respuesta de red incierta se conserva la imagen, porque
el guardado podría haberse confirmado en la base.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
