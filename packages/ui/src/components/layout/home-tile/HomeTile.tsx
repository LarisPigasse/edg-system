// Riquadro grande della home (ADR055): contenuto al centro, piede facoltativo
//
// Occupa la larghezza della sua colonna (vedi HomeTileGrid, 320px al massimo)
// e tiene sempre la proporzione 5:4: a risoluzioni basse rimpicciolisce senza
// deformarsi. Con onClick diventa un pulsante.
//
// Toni (ADR056):
//   highlight  il primo riquadro, con nome e sottotitolo del frontend: bianco,
//              bordo grigio scuro, fermo
//   active     modulo utilizzabile: "acceso", grigio chiarissimo, bordo sky
//   muted      modulo in vetrina: "spento", contenuto in grigio come
//              disabilitato, bordo tratteggiato
//   default    neutro
// Solo i moduli utilizzabili (active) al passaggio del mouse si sollevano:
// bordo violet e una tenue ombra. Quelli in vetrina (muted) restano fermi. I colori sono variabili del tema
// (globals.css, --home-*), così reggono anche in modalità scura.
import React from 'react';

import { cn } from '../../../utils';

export type HomeTileTone = 'default' | 'highlight' | 'active' | 'muted';

const TONE_CLASSES: Record<HomeTileTone, string> = {
  default: 'border border-surface-border bg-surface-1',
  highlight: 'border border-home-app-border bg-home-app-bg',
  active: 'border border-home-module-border bg-home-module-bg',
  muted: 'border border-dashed border-surface-border bg-home-module-bg',
};

/** Effetto "sollevamento" dei moduli utilizzabili */
const LIFT_CLASSES = 'transition duration-200 hover:-translate-y-0.5 hover:border-home-module-border-hover hover:shadow-md';

export interface HomeTileProps {
  children: React.ReactNode;
  /** Riga in basso, separata (es. versione e stato di un modulo) */
  footer?: React.ReactNode;
  onClick?: () => void;
  tone?: HomeTileTone;
  /** Testo per chi usa un lettore di schermo / suggerimento al passaggio */
  title?: string;
  className?: string;
}

const HomeTile: React.FC<HomeTileProps> = ({ children, footer, onClick, tone = 'default', title, className }) => {
  const classes = cn(
    'flex aspect-5/4 w-full flex-col overflow-hidden rounded-2xl text-center',
    TONE_CLASSES[tone],
    tone === 'active' && LIFT_CLASSES,
    onClick && 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-home-module-border-hover',
    className
  );

  const content = (
    <>
      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-1 items-center justify-center p-6',
          tone === 'muted' && 'opacity-48 grayscale'
        )}
      >
        {children}
      </div>
      {/* Il filo del piede prende il colore del bordo (anche al passaggio del mouse) */}
      {footer && (
        <div className='flex min-w-0 items-center justify-center gap-2 overflow-hidden border-t border-inherit px-4 py-2 text-xs whitespace-nowrap text-text-secondary'>
          {footer}
        </div>
      )}
    </>
  );

  return onClick ? (
    <button type='button' onClick={onClick} title={title} className={classes}>
      {content}
    </button>
  ) : (
    <div title={title} className={classes}>
      {content}
    </div>
  );
};

export default HomeTile;
