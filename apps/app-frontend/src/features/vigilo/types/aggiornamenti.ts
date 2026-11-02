// src/features/vigilo/types/aggiornamenti.ts — aggiornamenti della libreria (B10b, vigilo-service /aggiornamenti)
import type { TipoSoggetto } from './valori';

export type EntitaAggiornamento = 'categoria' | 'controllo';
export type TipoProposta = 'aggiornamento' | 'ritiro';
/** intatto: il cliente non l'ha cambiato; personalizzato: sì */
export type StatoCampo = 'intatto' | 'personalizzato';
export type Scelta = 'mio' | 'libreria';
export type SceltaRitiro = 'tieni' | 'disattiva';
export type EsitoDecisione = 'accettato' | 'parziale' | 'rifiutato' | 'incluso' | 'escluso';

export interface CampoProposto {
  campo: string;
  stato: StatoCampo;
  mio: unknown;
  libreria: unknown;
  /** Già in parole dal servizio (cadenza, preavvisi, tolleranza, categorie) */
  testoMio?: string;
  testoLibreria?: string;
}

export interface VoceAggiornamento {
  entita: EntitaAggiornamento;
  uuid: string;
  nome: string;
  tipoSoggetto: TipoSoggetto;
  chiave: string;
  tipo: TipoProposta;
  attiva: boolean;
  versioneDa: number | null;
  versioneA: number;
  novita: string | null;
  disponibileDal: string | null;
  vistoIl: string | null;
  campi: CampoProposto[];
}

export interface ElencoAggiornamenti {
  voci: VoceAggiornamento[];
  aggiornamenti: number;
  ritiri: number;
}

export interface Decisione {
  versione: number;
  scelte?: Record<string, Scelta>;
  ritiro?: SceltaRitiro;
}

export interface EsitoDecisioneVoce {
  esito: EsitoDecisione;
  entita: EntitaAggiornamento;
  uuid: string;
  scadenzeCreate: number;
  scadenzeChiuse: number;
  scadenzeRicalcolate: number;
}

/** Un campo deciso, come lo conserva il registro */
export interface CampoDeciso {
  campo: string;
  mio: unknown;
  libreria: unknown;
  scelto: Scelta;
  testoMio?: string;
  testoLibreria?: string;
}

/** Una riga dello Storico della libreria (registro delle decisioni, ADR074) */
export interface RigaStoricoLibreria {
  uuid: string;
  contesto: 'avvio' | 'aggiornamento';
  esito: EsitoDecisione;
  versioneDa: number | null;
  versioneA: number;
  novita: string | null;
  disponibileDal: string | null;
  vistoIl: string | null;
  campi: CampoDeciso[];
  decisoIl: string;
  decisoDa: string | null;
  decisoDaEmail: string | null;
}
