// src/utils/floatingPosition.ts
//
// Dove aprire un pannello fluttuante (il calendario di DatePicker,
// l'orologio di TimePicker) rispetto al suo campo, dentro la finestra.
// Regola pura, come fanno i popper di Radix:
//   - sotto il campo se c'è posto;
//   - sopra se sotto non c'è e sopra sì;
//   - se non c'è da nessuna parte, dal lato con più spazio e spostato
//     quanto basta per restare dentro la finestra;
//   - in orizzontale allineato al campo, spostato a sinistra se uscirebbe.
// Distanza dal campo e margine dai bordi sono parametri.

export interface FloatingTrigger {
  top: number;
  bottom: number;
  left: number;
}

export interface FloatingSize {
  width: number;
  height: number;
}

export interface FloatingOptions {
  /** Distanza dal campo, in px */
  gap?: number;
  /** Margine minimo dai bordi della finestra, in px */
  margin?: number;
}

export interface FloatingPlacement {
  top: number;
  left: number;
  side: 'bottom' | 'top';
}

/** Tiene un valore fra min e max; se lo spazio non basta vince min (il bordo in alto o a sinistra) */
const dentro = (valore: number, min: number, max: number): number => Math.max(min, Math.min(valore, max));

/** La posizione del pannello (coordinate della finestra, per position: fixed) */
export function placeFloating(
  trigger: FloatingTrigger,
  panel: FloatingSize,
  viewport: FloatingSize,
  { gap = 4, margin = 8 }: FloatingOptions = {}
): FloatingPlacement {
  const sotto = viewport.height - trigger.bottom - gap - margin;
  const sopra = trigger.top - gap - margin;
  const side = panel.height <= sotto || sotto >= sopra ? 'bottom' : 'top';
  const top = side === 'bottom' ? trigger.bottom + gap : trigger.top - gap - panel.height;
  return {
    side,
    top: dentro(top, margin, viewport.height - margin - panel.height),
    left: dentro(trigger.left, margin, viewport.width - margin - panel.width),
  };
}
