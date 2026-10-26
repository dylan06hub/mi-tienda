// Catálogo de ejemplo: precios en ARS, datos y stock en memoria (sin base de datos).

import type { Producto, Variante } from "@/types";

function slug(valor: string) {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

// Genera todas las combinaciones de talle y color con el stock de cada talle.
function variantes(colores: string[], talles: [string, number][]): Variante[] {
  return colores.flatMap((color) =>
    talles.map(([talle, stock]) => ({
      id: `${slug(talle)}-${slug(color)}`,
      talle,
      color,
      stock,
    })),
  );
}

export const productos: Producto[] = [
  {
    id: "camiseta-esencial",
    nombre: "Camiseta Esencial",
    descripcion:
      "Camiseta de algodón orgánico de 220 g/m² con cuello redondo y corte recto. Suave, resistente y pensada para usarse hasta gastarse.",
    precio: 29900,
    categoria: "Camisetas",
    imagen: "/productos/camiseta.jpg",
    variantes: variantes(["Negro", "Blanco", "Verde oliva"], [
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
    precio: 59900,
    categoria: "Camisas",
    imagen: "/productos/camisa.jpg",
    variantes: variantes(["Arena", "Blanco"], [
      ["S", 5],
      ["M", 7],
      ["L", 4],
    ]),
  },
  {
    id: "buzo-norte",
    nombre: "Buzo Norte",
    descripcion:
      "Buzo de felpa peinada con capucha forrada y puños elásticos. Un clásico de entretiempo con la medida justa.",
    precio: 69900,
    categoria: "Buzos",
    imagen: "/productos/sudadera.jpg",
    variantes: variantes(["Gris marengo", "Negro"], [
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
    precio: 149900,
    categoria: "Chaquetas",
    imagen: "/productos/chaqueta.jpg",
    variantes: variantes(["Marrón", "Negro"], [
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
    precio: 79900,
    categoria: "Pantalones",
    imagen: "/productos/vaqueros.jpg",
    variantes: variantes(["Azul", "Negro"], [
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
    precio: 89900,
    categoria: "Vestidos",
    imagen: "/productos/vestido.jpg",
    variantes: variantes(["Verde oliva", "Negro"], [
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
    precio: 139900,
    categoria: "Abrigos",
    imagen: "/productos/abrigo.jpg",
    variantes: variantes(["Camel", "Gris"], [
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
    precio: 49900,
    categoria: "Faldas",
    imagen: "/productos/falda.jpg",
    variantes: variantes(["Negro", "Arena"], [
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
    precio: 24900,
    categoria: "Accesorios",
    imagen: "/productos/gorra.jpg",
    variantes: variantes(["Negro", "Arena"], [["Única", 15]]),
  },
  {
    id: "gafas-sol",
    nombre: "Gafas de Sol",
    descripcion:
      "Gafas de acetato con lentes polarizadas y protección UV400. Montura de cuidado, estuche incluido.",
    precio: 39900,
    categoria: "Accesorios",
    imagen: "/productos/gafas.jpg",
    variantes: variantes(["Carey", "Negro"], [["Única", 9]]),
  },
  {
    id: "bolso-tote",
    nombre: "Bolso Tote",
    descripcion:
      "Bolso tote de lona encerada con asas reforzadas y bolsillo interior. Cabe la vida entera.",
    precio: 54900,
    categoria: "Accesorios",
    imagen: "/productos/bolso.jpg",
    variantes: variantes(["Cuero", "Negro"], [["Única", 7]]),
  },
  {
    id: "zapatillas-runner",
    nombre: "Zapatillas Runner",
    descripcion:
      "Zapatilla de piel y malla con suela de goma natural. Diseñada para caminar mucho sin pensarlo.",
    precio: 99900,
    categoria: "Calzado",
    imagen: "/productos/zapatillas.jpg",
    variantes: variantes(["Blanco", "Negro"], [
      ["39", 4],
      ["40", 6],
      ["41", 5],
      ["42", 3],
      ["43", 0],
    ]),
  },
];

export const productosDestacados = productos.slice(0, 4);

const ALIAS_PRODUCTOS: Record<string, string> = {
  "sudadera-norte": "buzo-norte",
};

export function getProducto(id: string) {
  const idReal = ALIAS_PRODUCTOS[id] ?? id;
  return productos.find((producto) => producto.id === idReal);
}
