// src/features/vigilo/utils/giorni.ts
//
// I giorni come li scambia vigilo-service: 'YYYY-MM-DD', già nel fuso
// italiano. Si confrontano come testo e si spostano in UTC, senza ore.

export const aggiungiGiorni = (giorno: string, n: number): string => {
  const [a, m, g] = giorno.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, g + n)).toISOString().slice(0, 10);
};

/** "lunedì 13 ottobre 2026" */
export const giornoEsteso = (giorno: string): string => {
  const [a, m, g] = giorno.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, g)).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

/** Da 'YYYY-MM-DD' alla Date locale (mezzanotte) dei selettori di data */
export const daGiorno = (giorno: string): Date => {
  const [a, m, g] = giorno.split('-').map(Number);
  return new Date(a, m - 1, g);
};

/** Dalla Date locale dei selettori a 'YYYY-MM-DD' */
export const aGiorno = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** "14 ott 2026" */
export const giornoBreve = (giorno: string): string => {
  const [a, m, g] = giorno.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, g)).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

/**
 * Una data con "da" o "a" davanti, con l'articolo giusto: "dal 3 nov 2026",
 * "dall'11 nov 2026", "all'8 dic 2026", "al 1° gen 2027" (come conArticolo
 * del servizio)
 */
export function giornoCon(preposizione: 'da' | 'a', giorno: string): string {
  const g = Number(giorno.slice(8, 10));
  const breve = giornoBreve(giorno);
  const testo = g === 1 ? breve.replace(/^1 /, '1° ') : breve;
  const elisa = g === 8 || g === 11;
  return `${preposizione === 'da' ? (elisa ? "dall'" : 'dal ') : elisa ? "all'" : 'al '}${testo}`;
}

/** Oggi sul calendario di chi usa la pagina, come 'YYYY-MM-DD' */
export const oggiLocale = (): string => aGiorno(new Date());

/** Un istante (ISO) come "3 mar 2026 alle 10:42", in ora italiana: per i registri (B10b) */
export const istanteEsteso = (iso: string): string => {
  const d = new Date(iso);
  const giorno = d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Rome' });
  const ora = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' });
  return `${giorno} alle ${ora}`;
};
