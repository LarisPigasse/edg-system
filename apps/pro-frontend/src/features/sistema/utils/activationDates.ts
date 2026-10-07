// src/features/sistema/utils/activationDates.ts
//
// Date delle attivazioni dei moduli. Nella finestra si scelgono giorni, non
// orari: l'inizio vale dall'inizio del giorno scelto, la fine fino alla fine
// del giorno scelto (incluso). Così "prova fino al 6 novembre" significa che
// il 6 novembre il modulo funziona ancora.

const DAY_MS = 24 * 60 * 60 * 1000;

export const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
export const endOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
export const addDays = (d: Date, days: number): Date => new Date(d.getTime() + days * DAY_MS);

/** "06/11/2026" */
export const formatDate = (iso: string | Date): string =>
  new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

/** Giorni di calendario da oggi alla data (0 = oggi, negativo = passata) */
export function daysFromToday(iso: string | Date, now: Date = new Date()): number {
  return Math.round((startOfDay(new Date(iso)).getTime() - startOfDay(now).getTime()) / DAY_MS);
}

/** "oggi", "domani", "tra 12 giorni", "3 giorni fa" */
export function relativeDays(iso: string | Date, now: Date = new Date()): string {
  const n = daysFromToday(iso, now);
  if (n === 0) return 'oggi';
  if (n === 1) return 'domani';
  if (n === -1) return 'ieri';
  return n > 0 ? `tra ${n} giorni` : `${-n} giorni fa`;
}
