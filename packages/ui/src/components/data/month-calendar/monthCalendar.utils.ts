// packages/ui/src/components/data/month-calendar/monthCalendar.utils.ts
//
// Logica pura del calendario mensile: giorni come stringhe 'AAAA-MM-GG' e mesi
// come 'AAAA-MM', calcolati in UTC (niente ore, niente fusi). La griglia è
// sempre di 6 settimane da lunedì, così l'altezza non cambia da un mese
// all'altro.

export const MESI = [
  'gennaio',
  'febbraio',
  'marzo',
  'aprile',
  'maggio',
  'giugno',
  'luglio',
  'agosto',
  'settembre',
  'ottobre',
  'novembre',
  'dicembre',
] as const;

export const GIORNI_SETTIMANA = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'] as const;
const GIORNI_ESTESI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'] as const;

const GIORNO_MS = 86_400_000;
const daGiorno = (g: string) => new Date(`${g}T00:00:00Z`);
const aGiorno = (d: Date) => d.toISOString().slice(0, 10);

/** Oggi nel fuso del browser, come 'AAAA-MM-GG' */
export function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Il mese di un giorno: '2026-10-20' → '2026-10' */
export const monthOf = (day: string) => day.slice(0, 7);

/** Mese spostato di n (anche negativo): ('2026-12', 1) → '2027-01' */
export function addMonths(month: string, n: number): string {
  const [a, m] = month.split('-').map(Number);
  const totale = a * 12 + (m - 1) + n;
  return `${Math.floor(totale / 12)}-${String((totale % 12) + 1).padStart(2, '0')}`;
}

/** I 42 giorni della griglia del mese, da lunedì */
export function monthGrid(month: string): string[] {
  const primo = daGiorno(`${month}-01`);
  const daLunedi = (primo.getUTCDay() + 6) % 7;
  const inizio = primo.getTime() - daLunedi * GIORNO_MS;
  return Array.from({ length: 42 }, (_, i) => aGiorno(new Date(inizio + i * GIORNO_MS)));
}

/** Primo e ultimo giorno della griglia: il periodo da chiedere al servizio */
export function monthRange(month: string): { from: string; to: string } {
  const griglia = monthGrid(month);
  return { from: griglia[0], to: griglia[griglia.length - 1] };
}

/** "Ottobre 2026" */
export function monthTitle(month: string): string {
  const [a, m] = month.split('-').map(Number);
  const nome = MESI[m - 1];
  return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} ${a}`;
}

/** "lunedì 20 ottobre 2026" (per le etichette accessibili) */
export function dayTitle(day: string): string {
  const d = daGiorno(day);
  return `${GIORNI_ESTESI[d.getUTCDay()]} ${d.getUTCDate()} ${MESI[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Valido come mese 'AAAA-MM' */
export const isMonth = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
