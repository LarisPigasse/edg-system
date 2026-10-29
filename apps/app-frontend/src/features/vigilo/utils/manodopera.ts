// src/features/vigilo/utils/manodopera.ts
//
// Ore e costi della manodopera nel modulo e nello storico (passo 8): le ore si
// scrivono come "1,5" e si contano a quarti d'ora; i limiti sono quelli del
// servizio (domini/interventi/interventi.ts).
import type { Esecuzione } from '../types/scadenze';
import { importo } from './numeri';

export const LIMITI_MANODOPERA = { righe: 8, oreMassime: 1024, passoOre: 0.25 } as const;

export const ESECUZIONI: { value: Esecuzione; label: string }[] = [
  { value: 'interna', label: 'Interno' },
  { value: 'esterna', label: 'Esterno' },
  { value: 'entrambe', label: 'Entrambi' },
];

/** Le ore scritte in un campo: null se vuoto, NaN se non valide (oltre il massimo o non a quarti d'ora) */
export function ore(testo: string): number | null {
  const n = importo(testo);
  if (n === null || Number.isNaN(n)) return n;
  if (n <= 0 || n > LIMITI_MANODOPERA.oreMassime) return NaN;
  return Math.abs(Math.round(n / LIMITI_MANODOPERA.passoOre) * LIMITI_MANODOPERA.passoOre - n) < 1e-9 ? n : NaN;
}

/** "3,5 h" */
export const testoOre = (n: number): string => `${n.toLocaleString('it-IT', { maximumFractionDigits: 2 })} h`;

/** "1.250,50 €" */
export const euro = (n: number): string => n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

/** "internamente", "da un fornitore esterno", "internamente e da un fornitore" */
export const testoEsecuzione = (e: Esecuzione): string =>
  e === 'interna' ? 'internamente' : e === 'esterna' ? 'da un fornitore esterno' : 'internamente e da un fornitore';

// --- Le righe nel modulo Registra ----------------------------------------

export const DIPENDENTE = 'dipendente';

/** Una riga come la si scrive nel modulo */
export interface RigaInModulo {
  chiave: number;
  /** uuid della persona, o DIPENDENTE */
  persona: string;
  ore: string;
}

let progressivo = 0;
export const nuovaRiga = (): RigaInModulo => ({ chiave: ++progressivo, persona: DIPENDENTE, ore: '' });

export interface RighePronte {
  pronte: { persona: string | null; ore: number }[];
  /** Da mostrare in rosso: ore non valide o persona ripetuta */
  errore: string | null;
  /** Qualche riga senza ore: non si può confermare, ma non è un errore */
  incompleta: boolean;
}

/** Le righe pronte per il servizio, o perché non lo sono ancora */
export function righePronte(righe: RigaInModulo[]): RighePronte {
  const pronte = righe.map(r => ({ persona: r.persona === DIPENDENTE ? null : r.persona, ore: ore(r.ore) }));
  if (pronte.some(r => Number.isNaN(r.ore))) return { pronte: [], errore: 'Le ore si contano a quarti d’ora (es. 1,25)', incompleta: false };
  const persone = pronte.map(r => r.persona).filter(Boolean);
  if (new Set(persone).size !== persone.length) return { pronte: [], errore: 'La stessa persona è in due righe: somma le ore', incompleta: false };
  if (pronte.some(r => r.ore === null)) return { pronte: [], errore: null, incompleta: true };
  return { pronte: pronte as RighePronte['pronte'], errore: null, incompleta: false };
}
