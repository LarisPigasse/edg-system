// src/features/vigilo/types/soggetti.ts — soggetti (vigilo-service, soggetto.presenta)
import type { Contatore, Registrazione, RiferimentoSoggetto, Stato } from './scadenze';
import type { TipoSoggetto } from './valori';

export type StatoSoggetto = RiferimentoSoggetto['stato'];

export interface Soggetto {
  uuid: string;
  tipo: TipoSoggetto;
  categoria: { uuid: string; nome: string; icona: string | null } | null;
  nome: string;
  identificativo: string | null;
  /** "Targa", "Matricola"… */
  etichettaIdentificativo: string;
  codice: string | null;
  stato: StatoSoggetto;
  statoDal: string | null;
  /** Dati fissi del tipo (immatricolazione, marca…) */
  dati: Record<string, unknown>;
  /** Campi aggiuntivi della categoria */
  campi: Record<string, unknown>;
  sede: RiferimentoSoggetto | null;
  referente: RiferimentoSoggetto | null;
  contatori: Contatore[];
  assegnazioni: { uuid: string; persona: RiferimentoSoggetto | null; dal: string; al: string | null }[];
  note: string | null;
  /** Solo negli elenchi e nel dettaglio: la situazione delle scadenze aperte */
  scadenze?: { aperte: number; statoPeggiore: Stato | null; urgenzaIl: string | null };
  creatoIl: string;
  modificatoIl: string;
}

/** "attivi" = attivi e sospesi (gli archiviati si chiedono a parte) */
export type FiltroStato = 'attivi' | StatoSoggetto;

export interface FiltriSoggetti {
  categoria?: string;
  sede?: string;
  stato: FiltroStato;
}

export type OrdinaSoggetti = 'urgenza' | 'nome';

/** Esito di un cambio di stato (POST /soggetti/:id/stato) */
export interface EsitoStato {
  scadenzeChiuse: number;
  /** Al ripristino: quelle chiuse dall'archiviazione, con le loro date */
  scadenzeRiaperte: number;
  scadenzeCreate: number;
  assegnazioniTerminate: number;
}

/** Una registrazione dello storico, con la scadenza a cui appartiene */
export interface RegistrazioneStorico extends Registrazione {
  scadenza: { uuid: string; titolo: string } | null;
}

export interface Lettura {
  uuid: string;
  valore: number;
  lettoIl: string;
  fonte: 'manuale' | 'registrazione' | 'telematica' | 'importazione';
  /** Minore di una precedente: da controllare */
  anomala: boolean;
  note: string | null;
}

export interface Assegnazione {
  uuid: string;
  soggetto: RiferimentoSoggetto | null;
  persona: RiferimentoSoggetto | null;
  dal: string;
  al: string | null;
  note: string | null;
}

/** Il corpo di POST /soggetti e PATCH /soggetti/:id (i vuoti come null) */
export interface DatiSoggetto {
  tipo?: TipoSoggetto;
  categoria: string | null;
  nome: string;
  identificativo: string | null;
  codice: string | null;
  sede: string | null;
  referente: string | null;
  dati: Record<string, unknown>;
  campi: Record<string, unknown>;
  note: string | null;
}

/** Esito di creazione e modifica: che cosa è successo alle scadenze */
export interface EsitoSalvataggio {
  scadenzeCreate: number;
  scadenzeCompletate?: number;
}
