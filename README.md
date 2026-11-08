## Verificación (fase 4)

```sh
npm test
npm run test:db
npm run lint
npm run typecheck
npm run build
```

`test:db` requiere PostgreSQL (`initdb`, `pg_ctl`, `psql`) y Python 3 en PATH.
Crea una base temporal con conexión por socket local, instala el esquema y
ejecuta pruebas de transacciones, permisos y concurrencia. Detiene PostgreSQL
y elimina sus datos al terminar. No usa la base configurada en `.env.local`.
La autenticación de Supabase se simula; este comando no prueba GoTrue ni pg_cron.

Se verificaron 84 pruebas Node, las pruebas SQL y cinco escenarios concurrentes,
ESLint y TypeScript. El webhook ahora devuelve un error controlado si Mercado
Pago responde con un cuerpo nulo o que no es un objeto; se probaron también
firmas HMAC válidas e inválidas y fallos del proveedor.

El ensayo sandbox creó una preferencia real por $34.995 ARS y abrió el checkout
de Mercado Pago con las URLs de retorno y notificación previstas. El usuario
decidió no iniciar sesión: no se completaron el pago, el retorno ni la recepción
del webhook real. El pedido de prueba se conservó cancelado, se devolvió su stock,
se cerró el túnel temporal y se restauró `APP_URL`.

Pendientes antes de publicar: configurar una `APP_URL` pública activa y
`MP_WEBHOOK_SECRET`, completar la compra sandbox y obtener un build de producción.
En este entorno, Turbopack falla al abrir el socket de su proceso de plugins con
`Operation not permitted`; el build no quedó validado.

## Consultas y catálogo (fase 3)

Aplicar `supabase/consultas.sql` después de `schema.sql` antes de desplegar esta
versión. El formulario de contacto guarda las consultas desde el servidor y
confirma su recepción solo después de guardarlas. Los campos demasiado largos
se rechazan en lugar de truncarse; los datos de contacto no se escriben en logs.

La bandeja de solo lectura está en **Administración → Ver consultas**
(`/admin/consultas`), ordenada de más reciente a más antigua. Solo los
administradores pueden leerla; el cliente no tiene permisos de escritura.
No se envían correos automáticamente.

Los filtros de talle, color y disponibilidad deben coincidir en una misma
variante. El catálogo ya no recorta el listado a 50 productos.

Pruebas de permisos y validación (solo en una base de prueba):

```sh
npm test
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/consultas.sql
```

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

## Catálogo ficticio de prueba

Ejecutar `supabase/seed-catalogo-prueba.sql` en el SQL Editor del proyecto de
prueba, después de `schema.sql` y `sections.sql`. Publica 30 productos en 10
categorías, con 120 variantes y 8 destacados. Usa las imágenes ilustrativas de
`public/productos`; algunas se repiten entre modelos. Los precios y el stock son
ficticios. No requiere cambios en la aplicación ni reiniciar el servidor.

Los productos se identifican con el prefijo `demo-norte-`. Repetir la carga no
duplica filas ni sobrescribe ediciones o stock existente. Oculta los tres
registros anteriores (`remera-blanca-dc`, `remera-dc-azul`, `wdqwdf`) conservando
sus variantes e historial; se pueden volver a publicar desde el administrador.
Antes de vender, despublicar estos productos desde el panel y cargar datos reales.

## Diseño de la tienda

La portada fija elige un producto destacado con foto y stock; si no hay uno,
usa otra prenda disponible. Sin stock conserva el acceso al catálogo sin
promocionar productos agotados. La sección «Ofertas» del inicio muestra prendas
publicadas marcadas como oferta y se oculta si no hay ninguna. La opción se activa
en «Dónde se muestra» del formulario de producto. Las tarjetas muestran la etiqueta
y el precio cargado; no se calculan descuentos ni se inventan precios anteriores.

En móvil los filtros empiezan plegados, muestran cuántos criterios están activos
y mantienen las selecciones en la URL. En escritorio permanecen visibles.
Limpiar los filtros también restablece los campos de precio. Los controles tienen
foco visible, los talles anuncian su selección y hay un enlace para saltar al
contenido. El carrito usa un solo título principal y controles adaptados a móvil.

El formulario de contacto es el canal disponible. Se retiraron los enlaces de
correo y WhatsApp ficticios y las promesas de entrega o devolución sin confirmar.
Antes de una venta real hay que completar contactos, cobertura, plazos y políticas,
y reemplazar las imágenes y los productos ilustrativos.

Verificación local: `npm test`, `npm run lint`, `npm run typecheck` y
`npm run build`. Las pruebas de interfaz cubren portada, filtros, ficha, carrito
y acceso al checkout; una revisión visual no implica haber realizado un pago.

## Uso del panel de administración

En `/admin` hay un resumen del catálogo, los pedidos y las consultas, con accesos
a pedidos pagados por enviar, incidencias de pago y productos sin stock. La
navegación entre secciones está disponible en todas las pantallas del panel.
Los productos se buscan por nombre, categoría o código y se filtran por categoría,
publicación o stock; los pedidos, por cliente, número, email y estado. Las
consultas se pueden buscar y abrir individualmente para leerlas o responder por email.

El formulario de producto separa los datos de la prenda, los talles y stock, y la
publicación. Ofrece categorías existentes y muestra la foto actual. Los talles y
colores de combinaciones guardadas no se renombran: para cambiarlos, crear una
combinación nueva. El stock sigue siendo editable y se conserva la comprobación
de cambios concurrentes. Eliminar queda dentro de la edición, con confirmación y
las mismas restricciones de historial de pedidos.

## Identidad streetwear neón · fase 1

La dirección visual está documentada en `DESIGN.md`. `app/streetwear.css` define
los colores, Barlow Condensed Black y los estilos base para títulos y botones.
El documento raíz activa `.street-theme` en portada, catálogo, ficha, carrito,
checkout, contacto y todas las rutas de administración, incluido el acceso. La fuente se aloja en `public/fonts` con su licencia.
`tests/streetwear-contraste.test.mjs` comprueba los pares de texto y fondo antes
de usarlos. El panel comparte títulos condensados, foco cian y acciones lima; los estados de
pedidos y las advertencias mantienen colores y etiquetas diferenciados.

## Carrusel y tarjetas de la colección

Los destacados se exploran con deslizamiento nativo o los botones anterior y
siguiente. El carrusel informa el rango visible y admite flechas de teclado,
Inicio y Fin cuando recibe foco. No avanza automáticamente y respeta movimiento
reducido. Las tarjetas del carrusel y catálogo comparten fotografía 4:5, categoría,
talles con stock y precio visible; la elección de variantes sigue en la ficha.

## Campañas, cinta y footer

La portada usa cuatro campañas visuales (marca, ofertas, celebraciones y
destacados), con rotación de 6,5 segundos, selección manual y pausa. El foco y
la navegación manual detienen la rotación; hover, pestaña oculta y movimiento
reducido también la suspenden. Las ofertas y sus enlaces se toman del catálogo
publicado; no se calculan descuentos. Las campañas sin fotos usan un cartel gráfico.

La cinta bajo el header tiene pausa y respeta movimiento reducido. El footer
enlaza a las páginas generales de Instagram, TikTok y Facebook y a una ubicación
de muestra en Buenos Aires. Son datos de demostración, no perfiles o un local de
la marca. Los medios reales se confirman en el checkout de Mercado Pago.

## Ancho de las pantallas

`.site-shell` unifica el ancho máximo en 1.600 px y los márgenes laterales entre
16 y 48 px. Se usa en home, banners, destacados, ofertas, catálogo, ficha, carrito,
checkout, contacto, resultado de pago, header, footer y administración. Los estados
de carga usan la misma anchura; el formulario de acceso conserva un ancho de lectura cómodo.
