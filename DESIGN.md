---
name: norte. Streetwear neón
description: Identidad urbana de contraste alto con lima neón y cian.
colors:
  background: "#0B0B0D"
  surface: "#17171B"
  foreground: "#F4F4ED"
  muted: "#ADADA8"
  border: "#424247"
  accent: "#CCFF00"
  accent-hover: "#B8E600"
  secondary: "#00F0FF"
  on-accent: "#0B0B0D"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: "4px"
spacing:
  unit: "4px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.control}"
    padding: "12px 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
---

# norte. — Streetwear neón

## Overview

Marca urbana de ropa con fotografía real, títulos condensados y composición
editorial. Negro carbón y blanco hueso sostienen la identidad. El lima neón
marca la acción principal; el cian acompaña el foco y detalles puntuales.
La identidad evita brillos difusos, degradados, efectos de videojuego y ruido
decorativo. La ropa debe seguir siendo la protagonista.

Fase 1: sistema visual definido y disponible en `app/streetwear.css`. La
aplicación a portada, catálogo y compra corresponde a las siguientes fases.
La marca conserva el nombre **norte.**; no se agregan afirmaciones de escasez,
descuentos ni lanzamientos sin datos que las respalden.

## Colors

| Token CSS | Color | Uso |
| --- | --- | --- |
| `--street-background` | `#0B0B0D` | Fondo principal |
| `--street-surface` | `#17171B` | Superficies y controles secundarios |
| `--street-foreground` | `#F4F4ED` | Títulos y texto principal |
| `--street-muted` | `#ADADA8` | Descripciones y metadatos |
| `--street-border` | `#424247` | Separadores decorativos |
| `--street-accent` | `#CCFF00` | Acción principal y firma de marca |
| `--street-accent-hover` | `#B8E600` | Hover de la acción principal |
| `--street-secondary` | `#00F0FF` | Foco visible y detalles secundarios |
| `--street-on-accent` | `#0B0B0D` | Texto sobre lima o cian |

- Distribución orientativa: 80% neutros, 15% lima y 5% cian.
- El texto de botones neón es oscuro. No usar blanco sobre lima o cian.
- El lima es la prioridad visual; evitar varios botones lima compitiendo dentro
  del mismo bloque.
- Cian y lima no se combinan como texto y fondo entre sí.
- El borde tenue separa superficies: no sirve como único indicador de un campo
  o estado. Los controles usan borde claro y foco cian.
- Error, éxito, agotado y selección llevan texto o icono; el color nunca es
  la única señal. Los errores conservan una semántica diferenciada del neón.
- La paleta streetwear se activa en un contenedor `.street-theme`. El panel
  administrativo usa la misma base oscura, con estados semánticos diferenciados.

## Typography

- **Títulos y marca:** Barlow Condensed Black, peso 900, alojada en el proyecto.
  Usar mayúsculas en titulares cortos; interlineado 0,95 y tracking -0,02 em.
- **Lectura, navegación y formularios:** Geist, ya instalada. Peso 400–600,
  tamaño 16 px para lectura y campos; 14 px solo para información secundaria.
- **Precios y stock:** Geist con números tabulares. Mantener la moneda visible.
- Escala de títulos: 48–96 px en escritorio y 36–56 px en móvil. Reducir tamaño
  o ajustar el salto de línea antes de permitir desbordes.
- Las descripciones y acciones usan español argentino. Mayúsculas grandes para
  expresión de marca; capitalización normal para leer y comprar con comodidad.

Fuente de Barlow Condensed: repositorio oficial Google Fonts,
<https://github.com/google/fonts/tree/main/ofl/barlowcondensed>.
Licencia SIL Open Font License en `public/fonts/OFL-barlow-condensed.txt`.

## Layout

- Controles de esquinas casi rectas: radio de 4 px. Fotografías con bordes rectos.
- Alineaciones compartidas, bordes laterales iguales y espacios en múltiplos de
  4 px. Los bloques separan sus grupos por proximidad y espacio.
- Títulos contundentes, separadores finos y grilla de producto compacta.
- Alternar bloques oscuros con fotografía; el neón se usa como firma, no como
  baño de color sobre todas las prendas.
- Las fotos muestran la prenda con claridad. No recolorear imágenes para
  simular variantes ni usar decoraciones que tapen precio, talle o producto.

La identidad se aplica desde el documento raíz a la tienda y a `/admin`, incluido
el acceso al panel. Formularios y tablas mantienen tipografía de lectura; el lima
identifica la navegación activa y las acciones principales. El catálogo muestra dos columnas en
móvil y la portada prioriza un buzo destacado disponible, con alternativa al resto
de la colección si no hay uno.

## Components

- `.street-button`: acción principal lima, texto oscuro y altura mínima de 48 px.
- `.street-button--secondary`: acción alternativa transparente con borde claro.
- Hover: cambio de color de 140 ms. Presión: desplazamiento de 1 px.
- Foco por teclado: contorno cian de 2 px, separado 4 px del control.
- Deshabilitado: superficie oscura, texto legible y cursor que indica el estado.
- Sin carruseles automáticos, parpadeos, luces pulsantes ni animaciones continuas.
- Respetar `prefers-reduced-motion`; no desplazar controles al presionarlos cuando
  la preferencia está activa.

## Do's and Don'ts

1. Una acción principal clara por bloque y fotos coherentes con la colección.
2. Lectura y controles con contraste WCAG AA; verificar cada combinación real.
3. Navegación con teclado y estados perceptibles sin depender del color.
4. Catálogo, variantes, precios, carrito, autenticación y pagos conservan su
   funcionamiento al adoptar la identidad.
5. Revisar 320, 390, 768, 1024 y 1440 px y un teléfono real antes de publicar.
