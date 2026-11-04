// src/features/vigilo/constants/resoconti.ts — Spese e consumi (B10c)
import type { PeriodoSpese } from '../types/resoconti';

export const PERIODI_SPESE: { value: PeriodoSpese; label: string }[] = [
  { value: 'anno', label: 'Anno in corso' },
  { value: '12m', label: 'Ultimi 12 mesi' },
  { value: 'prec', label: 'Anno precedente' },
  { value: 'personalizzato', label: 'Dal… al…' },
];

/** Soggetti mostrati prima di "Mostra tutti" */
export const SOGGETTI_IN_VISTA = 16;

/** Fornitori o tipi mostrati in "A chi vanno" */
export const FORNITORI_IN_VISTA = 8;

/** Periodo personalizzato: come il servizio, al massimo 4 anni */
export const GIORNI_MASSIMI_SPESE = 1461;

/** Colori della variazione rispetto all'anno prima: la spesa che sale è da guardare */
export const COLORE_SALE = 'text-orange-700 [.dark_&]:text-orange-400';
export const COLORE_SCENDE = 'text-green-700 [.dark_&]:text-green-400';
export const COLORE_RIPARAZIONI = 'text-red-600 [.dark_&]:text-red-400';
