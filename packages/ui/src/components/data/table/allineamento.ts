// src/components/data/table/allineamento.ts
//
// Regola generale delle tabelle: l'intestazione di una colonna segue
// l'allineamento dei suoi valori (i numeri a destra, intestazione compresa).
// Separata da Table.tsx perché un file di componenti esporta solo componenti.

export type AllineamentoColonna = 'left' | 'center' | 'right';

/** L'allineamento di una colonna: quello dichiarato, o quello della sua className, poi a sinistra (pura) */
export const allineamentoColonna = (c: { align?: AllineamentoColonna; className?: string }): AllineamentoColonna =>
  c.align ?? (/(^|\s)text-right(\s|$)/.test(c.className ?? '') ? 'right' : /(^|\s)text-center(\s|$)/.test(c.className ?? '') ? 'center' : 'left');

export const TESTO_ALLINEATO: Record<AllineamentoColonna, string> = { left: 'text-left', center: 'text-center', right: 'text-right' };

/** Il contenitore di etichetta e freccia: a destra la freccia va prima, così l'etichetta sta sul bordo dei numeri */
export const INTESTAZIONE_ALLINEATA: Record<AllineamentoColonna, string> = { left: '', center: 'justify-center', right: 'flex-row-reverse' };
