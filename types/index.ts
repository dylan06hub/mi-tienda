// Tipos compartidos del dominio de la tienda.

/** Variante concreta de un producto: talle, color y stock disponible. */
export interface Variante {
  id: string;
  talle: string;
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

/** Producto con su estado de publicación para el panel de administración. */
export interface ProductoAdmin extends Producto {
  activo: boolean;
}

/** Línea del carrito: producto, variante elegida y cantidad. */
export interface ItemCarrito {
  productoId: string;
  varianteId: string;
  cantidad: number;
}

/** Datos mínimos del producto que necesita el carrito. */
export type ProductoCarrito = Pick<
  Producto,
  "id" | "nombre" | "precio" | "imagen" | "categoria"
>;

/** Línea del carrito ya validada contra la base. */
export interface LineaCarrito {
  producto: ProductoCarrito;
  variante: Variante;
  cantidad: number;
  subtotal: number;
}

/** Respuesta del servidor al validar el carrito. */
export interface CarritoValidado {
  items: ItemCarrito[];
  lineas: LineaCarrito[];
  subtotal: number;
  envio: number;
  total: number;
}

/** Pedido creado, totales recalculados y URL de pago. */
export interface PedidoCreado {
  id: string;
  subtotal: number;
  envio: number;
  total: number;
  initPoint: string;
}

/** Resultado de finalizar la compra. */
export type ResultadoCheckout =
  | { error: string }
  | { pedido: PedidoCreado };

/** Estados posibles de un pedido. */
export type EstadoPedido = "pendiente" | "pagado" | "enviado" | "cancelado";

/** Pedido tal como se muestra en el listado del panel. */
export interface PedidoAdmin {
  id: string;
  estado: EstadoPedido;
  total: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  creadoEn: string;
}

/** Línea de un pedido con los datos del producto y la variante. */
export interface ItemPedidoAdmin {
  productoId: string;
  productoNombre: string;
  varianteId: string;
  talle: string;
  color: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

/** Pedido con cliente, items y datos del pago. */
export interface PedidoDetalleAdmin extends PedidoAdmin {
  mpPaymentId: string | null;
  items: ItemPedidoAdmin[];
}

/** Acción disponible para un pedido en el panel. */
export interface AccionPedido {
  estado: "enviado" | "cancelado";
  label: string;
  confirmar?: string;
}
