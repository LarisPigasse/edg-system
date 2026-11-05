// src/features/vigilo/utils/rifornimenti.ts
//
// Rifornimenti in parole e cifre (tappa 2): il contatore su cui va la lettura
// (come il servizio), i campi del modulo letti e controllati prima di
// inviare, il prezzo al litro, i dettagli di una riga. Pure.
import { LIMITI_RIFORNIMENTO, VOCI_CON_LITRI } from '../constants/rifornimenti';
import type { VoceRifornimento } from '../types/rifornimenti';
import type { Contatore } from '../types/scadenze';
import { misura } from './misure';
import { importo as leggiDecimale, intero } from './numeri';

/** Il contatore principale del mezzo, come il servizio: quello senza nome, i km prima delle ore */
export function contatorePrincipale(contatori: readonly Contatore[]): Contatore | null {
  const senzaNome = (c: Contatore) => Number(!!c.nome?.trim());
  return [...contatori].sort((a, b) => senzaNome(a) - senzaNome(b) || Number(a.unita !== 'km') - Number(b.unita !== 'km'))[0] ?? null;
}

export const conLitri = (voce: VoceRifornimento): boolean => VOCI_CON_LITRI.includes(voce);

/** I campi del modulo come testo */
export interface CampiRifornimento {
  voce: VoceRifornimento;
  fattoIl: string;
  litri: string;
  importo: string;
  lettura: string;
}

/** I campi letti (null = vuoto, NaN = non valido) e l'errore di ciascuno, se c'è */
export function leggiCampi(c: CampiRifornimento, oggi: string) {
  const litri = conLitri(c.voce) ? leggiDecimale(c.litri) : null;
  const importo = leggiDecimale(c.importo);
  const lettura = intero(c.lettura);
  const L = LIMITI_RIFORNIMENTO;
  const errori = {
    fattoIl: !c.fattoIl ? 'Scegli la data' : c.fattoIl > oggi ? 'Non nel futuro' : undefined,
    importo:
      importo === null ? undefined : Number.isNaN(importo) ? 'Un importo, es. 85,40' : importo <= 0 || importo > L.importo ? `Da 0,01 a ${L.importo.toLocaleString('it-IT')} €` : undefined,
    litri: litri === null ? undefined : Number.isNaN(litri) ? 'Un numero, es. 42,5' : litri <= 0 || litri > L.litri ? `Da 0,01 a ${L.litri.toLocaleString('it-IT')} litri` : undefined,
    lettura: lettura === null ? undefined : Number.isNaN(lettura) || lettura > L.lettura ? 'Un numero intero' : undefined,
  };
  const pronto = importo !== null && !Object.values(errori).some(Boolean);
  return { litri, importo, lettura, errori, pronto };
}

/** Prezzo al litro, con 3 decimali; null senza litri */
export const prezzoAlLitro = (importo: number | null, litri: number | null): number | null =>
  importo && litri && litri > 0 && !Number.isNaN(importo) && !Number.isNaN(litri) ? Math.round((importo / litri) * 1000) / 1000 : null;

/** "1,789 €/l" */
export const prezzoLitroTesto = (n: number): string => `${n.toLocaleString('it-IT', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} €/l`;

/** "42,5 l" */
export const litriTesto = (n: number): string => `${n.toLocaleString('it-IT', { maximumFractionDigits: 2 })} l`;

/** "85,40 €" */
export const euroEsatti = (n: number): string => n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });

/** "115.880 km" della lettura, con "anomala" se non torna con le altre */
export const letturaTesto = (l: { valore: number; unita: 'km' | 'ore'; anomala: boolean }): string => `${misura(l.valore, l.unita)}${l.anomala ? ' (anomala)' : ''}`;
