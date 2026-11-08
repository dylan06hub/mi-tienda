import Link from "next/link";

const REDES = [
  { nombre: "Instagram", url: "https://www.instagram.com/" },
  { nombre: "TikTok", url: "https://www.tiktok.com/" },
  { nombre: "Facebook", url: "https://www.facebook.com/" },
];
const MAPA = "https://www.google.com/maps/search/?api=1&query=Av.+9+de+Julio+y+Av.+Corrientes,+Buenos+Aires";

export function Footer() {
  return (
    <footer className="future-footer">
      <div className="footer-spectrum" aria-hidden="true"><span /><span /><span /><span /></div>
      <div className="site-shell">
        <div className="footer-heading">
          <div>
            <Link href="/" className="footer-brand font-display font-black">norte<span>.</span></Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-street-muted">Tu calle. Tu forma. Prendas para combinar, salir y hacer tuyas.</p>
          </div>
          <Link href="/contacto" className="footer-contact">Hablemos <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="footer-columns">
          <div>
            <h2>Explorá</h2>
            <ul>
              <li><Link href="/productos">Toda la colección</Link></li>
              <li><Link href="/#destacados">Los imprescindibles</Link></li>
              <li><Link href="/carrito">Mi carrito</Link></li>
              <li><Link href="/contacto#preguntas-frecuentes">Envíos y devoluciones</Link></li>
            </ul>
          </div>
          <div>
            <h2>Comunidad</h2>
            <ul>{REDES.map((red) => <li key={red.nombre}><a href={red.url} target="_blank" rel="noopener noreferrer">{red.nombre} <span aria-hidden="true">↗</span><span className="sr-only"> (abre en otra pestaña)</span></a></li>)}</ul>
            <p className="footer-note">Enlaces a las plataformas. Perfiles de la marca pendientes.</p>
          </div>
          <div>
            <h2>Encontranos</h2>
            <p className="text-sm leading-6 text-street-muted">Av. 9 de Julio y Av. Corrientes<br />Buenos Aires, Argentina</p>
            <a href={MAPA} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm">Ver en Maps <span aria-hidden="true">↗</span><span className="sr-only"> (abre en otra pestaña)</span></a>
            <p className="footer-note">Ubicación de muestra. No es un local de norte.</p>
          </div>
          <div>
            <h2>Medios de pago</h2>
            <p className="payment-provider">Mercado Pago</p>
            <div className="payment-options" aria-label="Medios ilustrativos"><span>Tarjetas</span><span>Débito</span><span>Otros medios</span></div>
            <p className="footer-note">Las opciones disponibles se confirman en el checkout de Mercado Pago.</p>
            <Link href="/contacto" className="mt-3 inline-flex min-h-11 items-center text-sm">Consultar antes de comprar ↗</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© norte. Tienda de demostración. Productos, fotos, stock y campañas ilustrativos. Condiciones comerciales pendientes de confirmación.</p>
          <Link href="/contacto">Contacto</Link>
        </div>
      </div>
    </footer>
  );
}
