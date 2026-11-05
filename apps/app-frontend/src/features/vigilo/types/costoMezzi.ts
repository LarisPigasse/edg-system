// src/features/vigilo/types/costoMezzi.ts — costo dei mezzi (stima, tappa 1): vigilo-service, possesso dei soggetti e GET /resoconti/mezzi
import type { Intervallo } from './resoconti';
import type { TipoSoggetto } from './valori';

export type ModoPossesso = 'acquisto' | 'leasing' | 'noleggio';

/** Ciò che si scrive nella scheda del mezzo */
export interface DatiPossesso {
  modo: ModoPossesso;
  prezzo?: number;
  anni?: number;
  valoreFinale?: number;
  canone?: number;
  dal?: string | null;
}

/** Ciò che il servizio salva: i dati del modo scelto e la quota mensile */
export interface Possesso extends DatiPossesso {
  mensile: number;
}

/** GET /resoconti/possesso/anteprima */
export interface AnteprimaPossesso {
  mensile: number | null;
  errori: string[];
  avviso: string | null;
}

export type BaseCosto = 'km' | 'ore' | 'mese';

/** I blocchi del costo che possono spiegare un mezzo sopra la media */
export type BloccoCosto = 'possesso' | 'manutenzione' | 'uso';

export interface ConfrontoCosto {
  /** +40 = il 40% in più della media degli altri mezzi della categoria */
  scostamento: number;
  media: number;
  altri: number;
}

export interface CostoMezzo {
  uuid: string;
  nome: string;
  identificativo: string | null;
  tipo: TipoSoggetto;
  categoria: { uuid: string; nome: string } | null;
  /** Senza costo di possesso */
  parziale: boolean;
  mesi: number;
  possesso: { quota: number; obblighi: number; totale: number };
  manutenzione: { totale: number; guasti: number };
  /** Rifornimenti e uso: la spesa, i litri di carburante e il consumo (l/100 km o l/h, null se l'uso non basta) */
  rifornimenti: { totale: number; litri: number; consumo: number | null };
  totale: number;
  uso: { unita: 'km' | 'ore'; valore: number | null } | null;
  base: BaseCosto;
  costoPerUnita: number | null;
  confronto: {
    totale: ConfrontoCosto | null;
    manutenzione: ConfrontoCosto | null;
    segnalato: boolean;
    soprattutto: BloccoCosto | null;
  };
}

export interface CostoMezzi {
  periodo: Intervallo;
  soglie: { km: number; ore: number };
  sogliaScostamento: number;
  mezzi: CostoMezzo[];
}
