// Riduce in scala il contenuto finché non entra nel contenitore (mai ingrandisce)
//
// Serve dove un elemento disegnato a misura propria (es. il logo di un modulo,
// testo o immagine) deve stare in uno spazio dato senza essere ritoccato: lo
// si mostra com'è, solo più piccolo se serve. La scala si ricalcola quando
// cambiano il contenitore o il contenuto (immagine caricata, testo diverso).
//
// Il contenuto è posizionato in assoluto: così non conta nella larghezza
// minima del contenitore e non può allargarlo (un nome lungo non deforma il
// riquadro che lo ospita, nemmeno a risoluzioni basse).
import React, { useLayoutEffect, useRef, useState } from 'react';

import { cn } from '../../../utils';

interface ScaleToFitProps {
  children: React.ReactNode;
  className?: string;
}

const ScaleToFit: React.FC<ScaleToFitProps> = ({ children, className }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    // La trasformazione non cambia le misure di layout: niente cicli
    const update = () => {
      const s = Math.min(1, outer.clientWidth / inner.offsetWidth, outer.clientHeight / inner.offsetHeight);
      setScale(Number.isFinite(s) && s > 0 ? s : 1);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className={cn('relative h-full min-h-0 w-full min-w-0 overflow-hidden', className)}>
      <div
        ref={innerRef}
        className='absolute top-1/2 left-1/2 w-max'
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScaleToFit;
