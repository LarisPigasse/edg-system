// src/features/vigilo/types/resoconti.ts — Spese e consumi (vigilo-service, GET /resoconti/spese, B10c)
import type { VoceRifornimento } from './rifornimenti';
import type { NaturaEffettiva, TipoSoggetto } from './valori';

/** Nei resoconti, oltre alle nature delle scadenze, l'uso: i rifornimenti e le altre spese d'uso */
export type NaturaResoconto = NaturaEffettiva | 'uso';

export type PeriodoSpese = 'anno' | '12m' | 'prec' | 'personalizzato';

export interface FiltriSpese {
  periodo: PeriodoSpese;
  /** Solo con periodo personalizzato */
  dal?: string;
  al?: string;
  tipo?: TipoSoggetto;
  /** uuid della sede */
  sede?: string;
  testo?: string;
}

export interface Intervallo {
  dal: string;
  al: string;
}

export interface TotaliSpese {
  spesa: number;
  importi: number;
  manodopera: number;
  ore: number;
  registrazioni: number;
  conImporto: number;
}

export interface SpesaSoggetto {
  uuid: string;
  nome: string;
  identificativo: string | null;
  tipo: TipoSoggetto;
  n: number;
  spesa: number;
  spesaPrima: number;
  variazione: number | null;
  /** Contatore principale e uso nel periodo (null se non si può dire) */
  uso: { unita: 'km' | 'ore'; valore: number | null } | null;
  /** Spesa per km o per ora; null sotto la soglia minima d'uso */
  costoPerUnita: number | null;
}

export interface Spese {
  periodo: Intervallo;
  confronto: Intervallo;
  soglie: { km: number; ore: number };
  totale: TotaliSpese;
  totalePrima: TotaliSpese;
  riparazioni: { spesa: number; guasti: number; spesaPrima: number };
  perMese: { mese: string; importi: number; manodopera: number; prima: number }[];
  perNatura: { natura: NaturaResoconto; spesa: number; n: number }[];
  /** I rifornimenti voce per voce, con i litri (carburante e AdBlue) */
  perVoce: { voce: VoceRifornimento; spesa: number; n: number; litri: number }[];
  perSoggetto: SpesaSoggetto[];
  perFornitore: { uuid: string; nome: string; tipo: { chiave: string; nome: string } | null; importi: number; n: number }[];
  perTipoFornitore: { chiave: string; nome: string; importi: number; n: number }[];
}
