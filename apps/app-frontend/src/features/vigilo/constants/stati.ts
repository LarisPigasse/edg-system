// src/features/vigilo/constants/stati.ts
//
// Il colore di ogni stato di una scadenza (rivisto il 2026-10-13): rosso
// scaduta, arancio in tolleranza, verde in scadenza, ciano da completare,
// grigio in regola ("niente da guardare"). Due classi per stato: `numero` per
// le cifre grandi, `testo` per le scritte, un tono più scuro per leggersi
// bene anche piccolo. Nel tema scuro (classe .dark) i toni si schiariscono.
import type { Stato } from '../types/scadenze';

export interface Aspetto {
  etichetta: string;
  numero: string;
  testo: string;
}

export const STATI_ASPETTO: Record<Stato, Aspetto> = {
  scaduta: {
    etichetta: 'Scaduta',
    numero: 'text-red-500',
    testo: 'text-red-600 [.dark_&]:text-red-400',
  },
  'in-tolleranza': {
    etichetta: 'In tolleranza',
    numero: 'text-orange-500',
    testo: 'text-orange-700 [.dark_&]:text-orange-400',
  },
  'in-scadenza': {
    etichetta: 'In scadenza',
    numero: 'text-green-500',
    testo: 'text-green-700 [.dark_&]:text-green-400',
  },
  'da-completare': {
    etichetta: 'Da completare',
    numero: 'text-cyan-500',
    testo: 'text-cyan-700 [.dark_&]:text-cyan-400',
  },
  'in-regola': {
    etichetta: 'In regola',
    numero: 'text-text-secondary',
    testo: 'text-text-secondary',
  },
};
