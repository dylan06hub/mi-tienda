# norte. — Streetwear negro y rojo

La misma identidad se aplica desde el documento raíz a todas las vistas de tienda
y administración, incluidos acceso, formularios, carga, estados y footer.
Fotografías reales, títulos condensados y composición editorial conservan el foco en la ropa.

| Token | Hex | Uso |
| --- | --- | --- |
| background | #0A0A0A | Fondo general, carga y footer |
| surface | #404040 | Tarjetas y superficies secundarias |
| muted | #808080 | Metadatos y descripciones sobre negro; controles inactivos |
| fog | #C0C0C0 | Bordes de campos, placeholders y texto secundario sobre gris o borravino |
| foreground | #F8F8F8 | Lectura, títulos y precios |
| secondary | #FFFFFF | Foco visible, bordes y botones neutros |
| accent | #E60000 | CTA, carrito, selección y ofertas |
| danger / accent-hover | #800000 | Alertas, banners, agotado y hover |
| on-accent | #FFFFFF | Texto sobre rojo |

El rojo principal usa la variante #E60000 para permitir texto blanco legible.
Concrete Gray sobre Asphalt Gray no alcanza contraste de lectura: usar Fog Gray.
El foco blanco tiene contraste con negro, gris y borravino. Los estados siempre
conservan su etiqueta; el color no es la única señal. No inventar porcentajes,
precios anteriores ni escasez. No recolorear fotografías.

Títulos Barlow Condensed Black 900, alojada en el proyecto bajo SIL OFL;
lectura y formularios Geist, números tabulares en precios y stock.
Controles con radio de 4 px y acciones de al menos 48 px de alto.
`.site-shell`: ancho máximo 1600 px, margen lateral de 16 a 48 px.
Login mantiene un formulario compacto; catálogo de dos columnas en móvil.

Cuatro campañas rotan cada 6,5 segundos, con gesto, teclado y pausa discreta,
sin flechas ni selectores. La cinta tiene 32 px y gira sin botón de pausa ni interrupción por hover o foco;
respeta movimiento reducido.
Los carruseles de productos conservan desplazamiento nativo, teclado y contador.
Hover de fotografía solo con puntero preciso. Respetar movimiento reducido.

Footer con redes generales, dirección de muestra identificada y Mercado Pago.
Catálogo, variantes, carrito, autenticación y pagos mantienen su funcionamiento.
Revisar contraste, navegación con teclado, escritorio y móvil antes de publicar.

Las tarjetas muestran categoría debajo del título, fuera de la fotografía.
La cabecera se oculta al bajar y reaparece al subir o recibir foco de teclado;
la transición de 200 ms se elimina con movimiento reducido.
