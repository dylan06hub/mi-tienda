const WORDS = ["NORTE.", "OFERTAS", "LOS MEJORES PRODUCTOS", "TU CALLE. TU FORMA.", "STREETWEAR"];

export function AnnouncementRibbon() {
  return (
    <div className="announcement">
      <p className="sr-only">Norte. Ofertas, productos destacados y streetwear.</p>
      <div className="announcement-window" aria-hidden="true">
        <div className="announcement-track">
          {[0, 1].map((copy) => <div className="announcement-group" key={copy}>{WORDS.map((word) => <span key={word}>{word}<span className="announcement-star">✳</span></span>)}</div>)}
        </div>
      </div>
    </div>
  );
}
