// Tipos compartidos del dominio de la tienda.

/** Variante concreta de un producto: talla, color y stock disponible. */
export interface Variante {
  id: string;
  talla: string;
  color: string;
  stock: number;
}

/** Producto del catálogo con sus datos y variantes. */
export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string;
  variantes: Variante[];
}

/** Línea del carrito: producto, variante elegida y cantidad. */
export interface ItemCarrito {
  productoId: string;
  varianteId: string;
  cantidad: number;
}
