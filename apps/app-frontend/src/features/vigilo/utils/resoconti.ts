// src/features/vigilo/utils/resoconti.ts
//
// Spese e consumi in parole e cifre (B10c): euro senza centesimi per i totali,
// costo per km o per ora con tre decimali, variazione con il segno, il periodo
// "1 gen – 3 nov 2026". Il punto delle migliaia sempre, anche a quattro
// cifre ("1.492 €"): l'italiano di Intl raggruppa solo da 10.000. Funzioni pure.
import { COLORE_SALE, COLORE_SCENDE } from '../constants/resoconti';
import type { Intervallo } from '../types/resoconti';

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

/** Numero all'italiana con il punto delle migliaia sempre ('always' manca nei tipi di ES2020) */
const numero = (n: number, o: Intl.NumberFormatOptions = {}): string => new Intl.NumberFormat('it-IT', { ...o, useGrouping: 'always' } as unknown as Intl.NumberFormatOptions).format(n);

/** 27.665 € · 1.492 € */
export const euroTondi = (n: number): string => numero(n, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

/** Come euroTondi, ma sotto i 100 € con i centesimi: 1,33 € · 85,42 € · 1.890 € */
export const euroBrevi = (n: number): string =>
  Math.abs(n) > 0 && Math.abs(n) < 100 ? numero(n, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }) : euroTondi(n);

/** 0,055 €/km · 12,500 €/h */
export const costoUnita = (n: number, unita: 'km' | 'ore'): string =>
  `${numero(n, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} €/${unita === 'km' ? 'km' : 'h'}`;

/** 115.880 km · 512 h */
export const uso = (n: number, unita: 'km' | 'ore'): string => `${numero(Math.round(n))} ${unita === 'km' ? 'km' : 'h'}`;

/** 412,5 l · 1.230 l (sopra i 100 litri senza decimali) */
export const litri = (n: number): string => `${numero(n, { maximumFractionDigits: Math.abs(n) < 100 ? 1 : 0 })} l`;

/** Il consumo: 8,4 l/100 km · 6,2 l/h */
export const consumo = (n: number, unita: 'km' | 'ore'): string => `${numero(n, { maximumFractionDigits: 1 })} ${unita === 'km' ? 'l/100 km' : 'l/h'}`;

/** "+12%", "−20%", "=" */
export const variazioneTesto = (v: number): string => (v === 0 ? '=' : `${v > 0 ? '+' : '−'}${Math.abs(v)}%`);

/** La classe del colore: arancio se sale, verde se scende */
export const coloreVariazione = (v: number | null): string | undefined => (v === null || v === 0 ? undefined : v > 0 ? COLORE_SALE : COLORE_SCENDE);

/** La variazione in percentuale, null se l'anno prima non c'era spesa (come il servizio) */
export const variazione = (ora: number, prima: number): number | null => (prima ? Math.round(((ora - prima) / prima) * 100) : null);

/** "3 nov 2026" */
export function giornoCorto(g: string): string {
  const [a, m, d] = g.split('-').map(Number);
  return `${d} ${MESI[m - 1]} ${a}`;
}

/** "1 gen – 3 nov 2026" (l'anno una volta sola se è lo stesso) */
export function periodoTesto(p: Intervallo): string {
  const stessoAnno = p.dal.slice(0, 4) === p.al.slice(0, 4);
  const dal = giornoCorto(p.dal);
  return `${stessoAnno ? dal.slice(0, dal.lastIndexOf(' ')) : dal} – ${giornoCorto(p.al)}`;
}

/** "ott" dal mese "2026-10"; con l'anno se il grafico ne copre più d'uno ("ott 25") */
export const meseCorto = (mese: string, conAnno: boolean): string => `${MESI[Number(mese.slice(5)) - 1]}${conAnno ? ` ${mese.slice(2, 4)}` : ''}`;
