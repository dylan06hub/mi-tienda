import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HistoryTimeline } from "@/components/HistoryTimeline";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "El universo de norte.: streetwear, espacios e inspiración. Historia y locales de muestra de nuestra tienda de demostración.",
};

const fotos = [
  { src: "/nosotros/interior.webp", alt: "Interior ficticio de norte. con percheros negros, hormigón y un banco rojo", caption: "01 / La casa de norte." },
  { src: "/nosotros/fachada.webp", alt: "Fachada ficticia de un local de streetwear al anochecer", caption: "02 / La calle, siempre cerca" },
  { src: "/nosotros/detalle.webp", alt: "Prendas dobladas sobre una mesa de hormigón en un local ficticio", caption: "03 / Texturas de todos los días" },
];
const historia = [
  { year: "2022", title: "Una idea en la calle", text: "Una libreta, referencias urbanas y ganas de armar algo propio.", image: { src: "/nosotros/idea.webp", alt: "Bocetos y muestras de telas en un estudio ficticio de diseño de streetwear" } },
  { year: "2023", title: "La primera selección", text: "Remeras amplias, tonos neutros y prendas que se combinan entre sí.", image: fotos[2] },
  { year: "2024", title: "Un espacio para cruzarnos", text: "Imaginamos un local abierto a la ropa, la música y las conversaciones.", image: fotos[1] },
  { year: "2026", title: "El próximo capítulo", text: "Una tienda digital para seguir construyendo el universo de norte.", image: fotos[0] },
];
const sucursales = [
  { name: "Centro", zone: "Av. 9 de Julio y Av. Corrientes · Buenos Aires", lat: -34.6037, lon: -58.3816, bbox: "-58.390,-34.609,-58.373,-34.598", photo: fotos[1] },
  { name: "Palermo", zone: "Entorno de Plaza Italia · Buenos Aires", lat: -34.5813, lon: -58.4209, bbox: "-58.429,-34.587,-58.412,-34.576", photo: fotos[0] },
];

export default function NosotrosPage() {
  return (
    <div className="about-page">
      <section className="about-hero site-shell" aria-labelledby="nosotros-titulo">
        <div className="about-hero-copy">
          <p className="about-eyebrow">Nosotros / universo norte.</p>
          <h1 id="nosotros-titulo" className="street-title about-title">De la calle.<br /><span>Para vos.</span></h1>
          <p className="about-intro">Prendas para moverte a tu manera. Un lugar para encontrarnos, mezclar ideas y darle forma a lo que viene.</p>
          <a href="#historia" className="about-text-link">Conocé nuestra historia <span aria-hidden="true">↓</span></a>
          <p className="about-disclaimer">Universo de marca de muestra. Las fotos, la historia y los locales son ficticios.</p>
        </div>
        <figure className="about-hero-photo">
          <Image src={fotos[0].src} alt={fotos[0].alt} fill sizes="(min-width: 1600px) 752px, (min-width: 768px) 50vw, 100vw" loading="eager" fetchPriority="high" className="object-cover" />
          <figcaption>Concept store / imagen creada con IA</figcaption>
        </figure>
      </section>

      <section className="about-gallery" aria-label="Galería continua de locales ficticios">
        <div className="site-shell about-section-heading"><p className="about-eyebrow">Puertas adentro</p><h2 className="street-title text-4xl sm:text-5xl">Así imaginamos nuestro espacio.</h2></div>
        <div className="about-reel">
          <div className="about-reel-track">
            {[0, 1].map((copy) => <div key={copy} className="about-reel-group" aria-hidden={copy === 1 ? true : undefined}>
              {fotos.map((foto) => <figure className="about-reel-frame" key={foto.src}>
                <Image src={foto.src} alt={copy === 0 ? foto.alt : ""} fill sizes="(min-width: 1600px) 680px, 72vw" className="object-cover" />
                <figcaption>{foto.caption}</figcaption>
              </figure>)}
            </div>)}
          </div>
        </div>
        <p className="site-shell about-image-note">Galería conceptual. Ninguna imagen corresponde a un local real de norte.</p>
      </section>

      <section className="site-shell about-section" aria-labelledby="forma-titulo">
        <div className="about-section-heading"><p className="about-eyebrow">Lo que nos mueve</p><h2 id="forma-titulo" className="street-title text-5xl sm:text-6xl">Una forma de estar.</h2></div>
        <div className="about-values">
          {[
            ["01", "Tu estilo, tus reglas", "Oversize, capas y una paleta que deja espacio para tu propia combinación."],
            ["02", "Prendas para repetir", "Una selección pensada para acompañar distintos momentos del día y del año."],
            ["03", "Un punto de encuentro", "La ropa como excusa para compartir música, referencias y nuevas miradas."],
          ].map(([number, title, text]) => <article key={number} className="about-value"><span className="font-mono text-xs text-street-fog">/{number}</span><h3 className="street-title text-3xl">{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section id="historia" className="about-history" aria-labelledby="historia-titulo">
        <div className="site-shell about-section">
          <div className="about-section-heading"><p className="about-eyebrow">Nuestro recorrido</p><h2 id="historia-titulo" className="street-title text-5xl sm:text-6xl">De una idea a norte.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-street-fog">Una línea de tiempo ficticia para contar la identidad de esta tienda de demostración.</p></div>
          <HistoryTimeline steps={historia} />
        </div>
      </section>

      <section className="site-shell about-section about-detail" aria-labelledby="detalles-titulo">
        <figure className="about-detail-photo"><Image src={fotos[2].src} alt={fotos[2].alt} fill sizes="(min-width: 1600px) 752px, (min-width: 768px) 50vw, 100vw" className="object-cover" /><figcaption>Texturas / imagen conceptual</figcaption></figure>
        <div><p className="about-eyebrow">La misma energía, en cada detalle</p><h2 id="detalles-titulo" className="street-title text-5xl sm:text-6xl">El espacio también<br />se viste.</h2><p className="about-intro">Hormigón, acero, luz y un toque de rojo. Imaginamos espacios simples donde las prendas y las personas tengan lugar.</p><Link href="/productos" className="street-button mt-6">Explorá la colección <span aria-hidden="true">↗</span></Link></div>
      </section>

      <section id="sucursales" className="site-shell about-section" aria-labelledby="sucursales-titulo">
        <div className="about-section-heading"><p className="about-eyebrow">Dónde nos imaginamos</p><h2 id="sucursales-titulo" className="street-title text-5xl sm:text-6xl">Nuestras sucursales.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-street-muted">Espacios de muestra con ubicaciones ilustrativas. No son locales abiertos al público ni puntos de retiro.</p></div>
        <div className="about-branches">{sucursales.map((branch) => <article className="about-branch" key={branch.name}>
          <div className="about-branch-photo"><Image src={branch.photo.src} alt={`Local conceptual de ${branch.name}; imagen ficticia`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" /><span>Espacio conceptual</span></div>
          <div className="p-5 sm:p-6"><h3 className="street-title text-4xl">norte. {branch.name}</h3><p className="mt-3 text-sm leading-6 text-street-fog">{branch.zone}</p><p className="mt-1 text-xs text-street-fog">Sin atención al público · ubicación de muestra</p></div>
          <iframe title={`Mapa ilustrativo de norte. ${branch.name}`} src={`https://www.openstreetmap.org/export/embed.html?bbox=${branch.bbox}&layer=mapnik&marker=${branch.lat},${branch.lon}`} loading="lazy" referrerPolicy="no-referrer" className="about-map" />
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 text-xs sm:px-6"><a href={`https://www.openstreetmap.org/?mlat=${branch.lat}&mlon=${branch.lon}#map=16/${branch.lat}/${branch.lon}`} target="_blank" rel="noopener noreferrer" className="about-text-link">Abrir mapa <span aria-hidden="true">↗</span><span className="sr-only"> (abre en otra pestaña)</span></a><span className="text-street-fog">© OpenStreetMap</span></div>
        </article>)}</div>
      </section>
      <section className="about-closing"><div className="site-shell"><p className="about-eyebrow">Nos vemos en la colección</p><h2 className="street-title text-5xl sm:text-7xl">Encontrá tu próximo look.</h2><div className="mt-7 flex flex-wrap gap-3"><Link href="/productos" className="street-button">Ver catálogo</Link><Link href="/contacto" className="street-button street-button--secondary">Hablemos</Link></div></div></section>
    </div>
  );
}
