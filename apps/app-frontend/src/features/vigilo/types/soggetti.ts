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
  /** Solo nel dettaglio di una persona: l'account collegato (B9b) */
  account?: AccountPersona | null;
  /** Solo persone e solo a chi ha vigilo.costi: €/h della manodopera (passo 8) */
  costoOrario?: number | null;
  creatoIl: string;
  modificatoIl: string;
}

/** L'account collegato a una persona (B9b) */
export interface AccountPersona {
  id: number;
  nome: string;
  email: string;
}

/** GET /account: gli account del cliente, con la persona a cui sono già collegati */
export interface AccountCollegabile extends AccountPersona {
  /** Ha solo vigilo.own */
  addetto: boolean;
  persona: { uuid: string; nome: string } | null;
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
  /** L'ha inserita chi chiede (l'addetto corregge solo le sue, B9b) */
  tua: boolean;
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
  /** Solo persone, solo con vigilo.costi (passo 8) */
  costoOrario?: number | null;
}

/** Esito di creazione e modifica: che cosa è successo alle scadenze */
export interface EsitoSalvataggio {
  scadenzeCreate: number;
  scadenzeCompletate?: number;
}
