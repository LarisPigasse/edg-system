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

/** Oggi sul calendario di chi usa la pagina, come 'YYYY-MM-DD' */
export const oggiLocale = (): string => aGiorno(new Date());
