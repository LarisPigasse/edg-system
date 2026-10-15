// src/features/vigilo/utils/numeri.ts

/** Un intero non negativo scritto in un campo: null se vuoto, NaN se non valido */
export const intero = (testo: string): number | null => {
  const t = testo.trim().replace(/\./g, '');
  if (!t) return null;
  const n = Number(t);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
};

/** Un importo in euro scritto in un campo: "1.250,50" oppure "1250.50" */
export const importo = (testo: string): number | null => {
  let t = testo.trim();
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
};
