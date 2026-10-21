// src/features/vigilo/constants/fasce.ts
//
// Le fasce di urgenza di una scadenza aperta e i loro colori (2026-10-13;
// quale fascia ha una scadenza lo decide utils/fasce.ts):
//   scaduta rosso · in tolleranza arancio · entro 8 giorni ambra ·
//   entro 32 giorni verde · più avanti verde chiaro · da completare ciano ·
//   in regola grigio chiaro (gray-200, testo scuro; scelto il 2026-10-15).
// `numero` per le cifre grandi, `fondo` per etichette e pallini (calendario)
// e `card` per le schede colorate: lo stesso
// tono 500, testo bianco sulle schede (in regola: gray-200 con testo scuro,
// "niente da fare"). `card` dà anche il colore del bordo, fermo e al
// passaggio: un solo bordo (prima un anello in più faceva la doppia riga).
// Tutte le classi sono scritte per intero: Tailwind le vede così.

export const FASCE = ['scaduta', 'tolleranza', 'entro8', 'entro32', 'oltre', 'da-completare', 'in-regola'] as const;
export type Fascia = (typeof FASCE)[number];

interface AspettoFascia {
  etichetta: string;
  numero: string;
  fondo: string;
  card: string;
}

export const FASCE_ASPETTO: Record<Fascia, AspettoFascia> = {
  scaduta: {
    etichetta: 'Scadute',
    numero: 'text-red-500',
    fondo: 'bg-red-500 text-white',
    card: 'bg-red-500 text-white border-transparent hover:border-white/70',
  },
  tolleranza: {
    etichetta: 'In tolleranza',
    numero: 'text-orange-500',
    fondo: 'bg-orange-500 text-white',
    card: 'bg-orange-500 text-white border-transparent hover:border-white/70',
  },
  entro8: {
    etichetta: 'Entro 8 giorni',
    numero: 'text-amber-500',
    fondo: 'bg-amber-500 text-white',
    card: 'bg-amber-500 text-white border-transparent hover:border-white/70',
  },
  entro32: {
    etichetta: 'Entro 32 giorni',
    numero: 'text-green-500',
    fondo: 'bg-green-500 text-white',
    card: 'bg-green-500 text-white border-transparent hover:border-white/70',
  },
  oltre: {
    etichetta: 'Più avanti',
    numero: 'text-green-500',
    fondo: 'bg-green-400 text-white',
    card: 'bg-green-400 text-white border-transparent hover:border-white/70',
  },
  'da-completare': {
    etichetta: 'Da completare',
    numero: 'text-cyan-500',
    fondo: 'bg-cyan-500 text-white',
    card: 'bg-cyan-500 text-white border-transparent hover:border-white/70',
  },
  'in-regola': {
    etichetta: 'In regola',
    numero: 'text-text-secondary',
    fondo: 'bg-gray-200 text-text-primary',
    card: 'bg-gray-200 text-text-primary border-transparent hover:border-white/70',
  },
};
