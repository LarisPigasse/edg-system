// src/features/vigilo/utils/numeri.ts

/** Un intero non negativo scritto in un campo: null se vuoto, NaN se non valido */
export const intero = (testo: string): number | null => {
  const t = testo.trim().replace(/\./g, '');
  if (!t) return null;
  const n = Number(t);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
};

/**
 * Un numero non negativo scritto in un campo, arrotondato a `decimali`:
 * "1.250,50", "1250,50", "1250.50" o, senza virgola, con il punto delle
 * migliaia: "120.000" e "1.250.000" (gruppi di tre cifre; "0.806" resta un
 * decimale). Null se vuoto, NaN se non valido.
 */
export const numeroScritto = (testo: string, decimali: number): number | null => {
  let t = testo.trim();
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  // migliaia solo se il primo gruppo non comincia con zero: "0.806" è un decimale
  else if (/^[1-9]\d{0,2}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  if (!t) return null;
  const n = Number(t);
  const f = 10 ** decimali;
  return Number.isFinite(n) && n >= 0 ? Math.round(n * f) / f : NaN;
};

/** Un importo in euro, al centesimo */
export const importo = (testo: string): number | null => numeroScritto(testo, 2);

/** Un costo unitario (€/km, €/h), al millesimo come quelli calcolati da Vigilo */
export const costoUnitario = (testo: string): number | null => numeroScritto(testo, 3);
