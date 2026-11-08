"use client";

import { useState } from "react";

const WORDS = ["NORTE.", "OFERTAS", "LOS MEJORES PRODUCTOS", "TU CALLE. TU FORMA.", "STREETWEAR"];

export function AnnouncementRibbon() {
  const [paused, setPaused] = useState(false);
  return (
    <div className="announcement" data-paused={paused}>
      <p className="sr-only">Norte. Ofertas, productos destacados y streetwear.</p>
      <div className="announcement-window" aria-hidden="true">
        <div className="announcement-track">
          {[0, 1].map((copy) => <div className="announcement-group" key={copy}>{WORDS.map((word) => <span key={word}>{word}<span className="announcement-star">✳</span></span>)}</div>)}
        </div>
      </div>
      <button type="button" className="announcement-pause" aria-label={paused ? "Reanudar cinta" : "Pausar cinta"} onClick={() => setPaused((value) => !value)}>{paused ? "▶" : "Ⅱ"}</button>
    </div>
  );
}
