import type { Producto } from "@/types";

type CampaignProduct = Pick<Producto, "id" | "nombre" | "imagen" | "categoria">;
export type HomeCampaign = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  href: string;
  action: string;
  product: CampaignProduct | null;
};

export function getHomeCampaigns(productos: Producto[]): HomeCampaign[] {
  const disponibles = productos.filter((p) => p.imagen && p.variantes.some((v) => v.stock > 0));
  const marca = disponibles.find((p) => p.destacado && p.categoria === "Buzos") ?? disponibles.find((p) => p.destacado) ?? disponibles[0];
  const oferta = productos.find((p) => p.oferta && p.variantes.some((v) => v.stock > 0));
  const destacados = disponibles.find((p) => p.destacado && p.categoria === "Remeras") ?? disponibles.find((p) => p.destacado && p.id !== marca?.id) ?? marca;
  const tieneDestacados = productos.some((p) => p.destacado);
  const fiestas = (oferta?.imagen ? oferta : undefined) ?? disponibles.find((p) => p.categoria === "Camisas") ?? marca;
  const foto = (p?: Producto): CampaignProduct | null => p?.imagen ? { id: p.id, nombre: p.nombre, imagen: p.imagen, categoria: p.categoria } : null;

  return [
    { id: "marca", label: "Norte", eyebrow: "norte. / Streetwear", title: "TU CALLE.", highlight: "TU FORMA.", description: "Prendas para moverte a tu manera. Encontrá tu próxima combinación y elegí tu talle.", href: "/productos", action: "Ver la colección", product: foto(marca) },
    { id: "ofertas", label: "Ofertas", eyebrow: "Selección en oferta", title: "ACTIVÁ", highlight: "MODO OFERTA.", description: oferta ? "Las prendas en oferta, en un solo lugar. Elegí tu favorita y consultá sus talles disponibles." : "Las ofertas aparecerán acá cuando haya prendas disponibles. Mientras tanto, encontrá tu próxima prenda en la colección.", href: oferta ? "/#ofertas" : "/productos", action: oferta ? "Explorar ofertas" : "Explorar catálogo", product: foto(oferta ?? disponibles.find((p) => p.categoria === "Calzado") ?? marca) },
    { id: "fiestas", label: "Fechas especiales", eyebrow: "Especial celebraciones / campaña de muestra", title: "LOOKS PARA", highlight: "FESTEJAR.", description: oferta ? "Regalos, encuentros y prendas en oferta. Una selección para celebrar a tu manera." : "Para regalar, salir o celebrar. Armá un look para tu próxima ocasión especial.", href: oferta ? "/#ofertas" : "/productos", action: oferta ? "Ver prendas en oferta" : "Armar mi look", product: foto(fiestas) },
    { id: "destacados", label: "Destacados", eyebrow: "Los elegidos de norte.", title: "LOS MEJORES", highlight: "DE NORTE.", description: tieneDestacados ? "Nuestra selección destacada. Prendas para combinar, repetir y hacer tuyas." : "Explorá la colección y encontrá las prendas que van con vos.", href: tieneDestacados ? "/#destacados" : "/productos", action: tieneDestacados ? "Ver destacados" : "Explorar colección", product: foto(destacados) },
  ];
}
