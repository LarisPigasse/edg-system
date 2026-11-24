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
  /** Le due componenti (2026-11-18): fissa per ora di impiego, variabile per km o ora motore */
  componenti?: { fissoOra: number | null; variabile: number | null; unita: 'km' | 'ore' | null; oreImpiego: number };
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

// --- Andamento dei costi di un mezzo (GET /resoconti/mezzi/:id/andamento, 2026-11-16) ---

/** I periodi dell'andamento: ultimi 12 mesi chiusi (predefinito), come la scheda (12m, fino a oggi), anno, anno precedente, da quando c'è, dal… al… */
export type PeriodoAndamento = 'chiusi' | '12m' | 'anno' | 'prec' | 'inizio' | 'personalizzato';

/** I tipi di grafico dell'andamento */
export type TipoGraficoAndamento = 'linee' | 'barre' | 'aree' | 'ciambella';

export interface MeseCosti {
  /** "AAAA-MM" */
  mese: string;
  quota: number;
  /** Ripartiti sui 12 mesi dal pagamento */
  obblighi: number;
  /** quota + obblighi */
  possesso: number;
  manutenzione: number;
  uso: number;
  totale: number;
}

export interface AndamentoCosti {
  periodo: { dal: string; al: string };
  /** "Da quando c'è" oltre i 4 anni: si mostrano gli ultimi 4 */
  troncato: boolean;
  /** Il periodo non contiene ancora mesi chiusi (solo dati consolidati: es. anno in corso a gennaio) */
  nessunMeseChiuso: boolean;
  /** false nel periodo "Ultimi 12 mesi": obblighi per intero nel mese del pagamento, come la scheda */
  obblighiRipartiti: boolean;
  /** "AAAA-MM" del mese in corso, parziale fino a oggi (solo nel periodo "Ultimi 12 mesi") */
  meseInCorso: string | null;
  possesso: { mensile: number; modo: ModoPossesso; dal: string | null } | null;
  mesi: MeseCosti[];
  totali: { quota: number; obblighi: number; possesso: number; manutenzione: number; uso: number; totale: number };
  /** Percentuale di ogni blocco sul totale del periodo */
  quote: { possesso: number; manutenzione: number; uso: number };
}
