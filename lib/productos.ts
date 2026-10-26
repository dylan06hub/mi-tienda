// Catálogo de ejemplo: datos y stock en memoria (sin base de datos).

import type { Producto, Variante } from "@/types";

// Genera las variantes de un producto a partir de sus tallas y stock.
function variantes(color: string, tallas: [string, number][]): Variante[] {
  return tallas.map(([talla, stock]) => ({
    id: talla.toLowerCase().replace(/\s+/g, "-"),
    talla,
    color,
    stock,
  }));
}

export const productos: Producto[] = [
  {
    id: "camiseta-esencial",
    nombre: "Camiseta Esencial",
    descripcion:
      "Camiseta de algodón orgánico de 220 g/m² con cuello redondo y corte recto. Suave, resistente y pensada para usarse hasta gastarse.",
    precio: 29.9,
    categoria: "Camisetas",
    imagen: "/productos/camiseta.jpg",
    variantes: variantes("Negro", [
      ["XS", 12],
      ["S", 8],
      ["M", 10],
      ["L", 6],
      ["XL", 0],
    ]),
  },
  {
    id: "camisa-lino",
    nombre: "Camisa de Lino",
    descripcion:
      "Camisa de lino lavado de caída ligera, con bolsillo pecho y botones de corozo. Fresca en verano y perfecta como capa en invierno.",
    precio: 59.9,
    categoria: "Camisas",
    imagen: "/productos/camisa.jpg",
    variantes: variantes("Arena", [
      ["S", 5],
      ["M", 7],
      ["L", 4],
    ]),
  },
  {
    id: "sudadera-norte",
    nombre: "Sudadera Norte",
    descripcion:
      "Sudadera de felpa peinada con capucha forrada y puños elásticos. Un clásico de entretiempo con la medida justa.",
    precio: 69.9,
    categoria: "Sudaderas",
    imagen: "/productos/sudadera.jpg",
    variantes: variantes("Gris marengo", [
      ["S", 6],
      ["M", 9],
      ["L", 5],
      ["XL", 2],
    ]),
  },
  {
    id: "chaqueta-cuero",
    nombre: "Chaqueta de Cuero",
    descripcion:
      "Chaqueta de piel vacuno con acabado mate, forro interior y cremallera lateral. Envejece bien y mejora con el uso.",
    precio: 149.9,
    categoria: "Chaquetas",
    imagen: "/productos/chaqueta.jpg",
    variantes: variantes("Marrón", [
      ["S", 3],
      ["M", 4],
      ["L", 2],
    ]),
  },
  {
    id: "vaqueros-straight",
    nombre: "Vaqueros Straight",
    descripcion:
      "Vaquero de denim rígido con tiro alto y pernera recta. Sin elásticos ni artificios: el jean de siempre, bien hecho.",
    precio: 79.9,
    categoria: "Pantalones",
    imagen: "/productos/vaqueros.jpg",
    variantes: variantes("Azul", [
      ["36", 4],
      ["38", 6],
      ["40", 5],
      ["42", 2],
    ]),
  },
  {
    id: "vestido-midi",
    nombre: "Vestido Midi",
    descripcion:
      "Vestido midi de viscosa fluida con manga corta y cintura marcada. Cómodo de día, elegante de noche.",
    precio: 89.9,
    categoria: "Vestidos",
    imagen: "/productos/vestido.jpg",
    variantes: variantes("Verde oliva", [
      ["XS", 3],
      ["S", 5],
      ["M", 4],
      ["L", 2],
    ]),
  },
  {
    id: "abrigo-largo",
    nombre: "Abrigo Largo",
    descripcion:
      "Abrigo de lana mezclada con solapa cruzada y bolsillos interiores. Abriga de verdad y combina con todo.",
    precio: 139.9,
    categoria: "Abrigos",
    imagen: "/productos/abrigo.jpg",
    variantes: variantes("Camel", [
      ["S", 2],
      ["M", 3],
      ["L", 2],
    ]),
  },
  {
    id: "falda-plisada",
    nombre: "Falda Plisada",
    descripcion:
      "Falda de tablas con caída fluida y cintura elástica. Se mueve bien y no se pega.",
    precio: 49.9,
    categoria: "Faldas",
    imagen: "/productos/falda.jpg",
    variantes: variantes("Negro", [
      ["XS", 4],
      ["S", 6],
      ["M", 3],
    ]),
  },
  {
    id: "gorra-clasica",
    nombre: "Gorra Clásica",
    descripcion:
      "Gorra de sarga de algodón con visera curva y cierre ajustable. Ligera, lavable y sin logos gritones.",
    precio: 24.9,
    categoria: "Accesorios",
    imagen: "/productos/gorra.jpg",
    variantes: variantes("Negro", [["Única", 15]]),
  },
  {
    id: "gafas-sol",
    nombre: "Gafas de Sol",
    descripcion:
      "Gafas de acetato con lentes polarizadas y protección UV400. Montura de cuidado, estuche incluido.",
    precio: 39.9,
    categoria: "Accesorios",
    imagen: "/productos/gafas.jpg",
    variantes: variantes("Carey", [["Única", 9]]),
  },
  {
    id: "bolso-tote",
    nombre: "Bolso Tote",
    descripcion:
      "Bolso tote de lona encerada con asas reforzadas y bolsillo interior. Cabe la vida entera.",
    precio: 54.9,
    categoria: "Accesorios",
    imagen: "/productos/bolso.jpg",
    variantes: variantes("Cuero", [["Única", 7]]),
  },
  {
    id: "zapatillas-runner",
    nombre: "Zapatillas Runner",
    descripcion:
      "Zapatilla de piel y malla con suela de goma natural. Diseñada para caminar mucho sin pensarlo.",
    precio: 99.9,
    categoria: "Calzado",
    imagen: "/productos/zapatillas.jpg",
    variantes: variantes("Blanco", [
      ["39", 4],
      ["40", 6],
      ["41", 5],
      ["42", 3],
      ["43", 0],
    ]),
  },
];

export const productosDestacados = productos.slice(0, 4);

export function getProducto(id: string) {
  return productos.find((producto) => producto.id === id);
}
