// src/features/vigilo/types/avvio.ts — /api/vigilo/avvio (ADR076)
import type { Frasi, Natura, Predefiniti, Rinnovo, TipoSoggetto } from './valori';

/** Riquadro di un modello di settore (passo 1) */
export interface ModelloSettore {
  chiave: string;
  nome: string;
  descrizione: string | null;
  icona: string | null;
  versione: number;
  ordine: number;
  sempreProposto: boolean;
  preselezionato: boolean;
  applicato: boolean;
  categorie: number;
  controlli: number;
  controlliPerTipo: Partial<Record<TipoSoggetto, number>>;
}

export interface StatoAvvio {
  avviatoIl: string | null;
  modelliApplicati: { chiave: string; versione: number }[];
  predefiniti: Predefiniti;
  modelli: ModelloSettore[];
  /** ADR088: chi prepara Vigilo e se l'utente può avviare */
  preparazione: 'cliente' | 'edg';
  puoAvviare: boolean;
  /** Settori suggeriti da EDG all'attivazione (già spuntati in `modelli`) */
  modelliSuggeriti: string[];
}

export interface CategoriaProposta {
  chiave: string;
  nome: string;
  descrizione: string | null;
  icona: string | null;
  contatori: string[];
  preselezionata: boolean;
  modelli: string[];
  /** uuid della copia del cliente, se la ha già */
  presente: string | null;
}

export interface ControlloProposto {
  chiave: string;
  codice: string | null;
  nome: string;
  descrizione: string | null;
  natura: Natura;
  automatico: boolean;
  rinnovo: Rinnovo;
  riferimentoNormativo: string | null;
  /** Chiavi delle categorie di libreria; vuoto = tutti i soggetti del tipo */
  categorie: string[];
  frasi: Frasi;
  preselezionata: boolean;
  modelli: string[];
  presente: string | null;
}

export interface GruppoTipo {
  tipo: TipoSoggetto;
  categorie: CategoriaProposta[];
  controlli: ControlloProposto[];
}

export interface Proposta {
  modelli: { chiave: string; nome: string; descrizione: string | null; icona: string | null; versione: number }[];
  tipi: GruppoTipo[];
  categorieDelCliente: string[];
  riepilogo: {
    categorie: number;
    controlli: number;
    preselezionate: { categorie: number; controlli: number };
    giaPresenti: { categorie: number; controlli: number };
  };
}

export interface SceltaAvvio {
  modelli: string[];
  categorie: string[];
  controlli: string[];
  predefiniti?: Predefiniti;
}

export interface EsitoAvvio {
  primoAvvio: boolean;
  avviatoIl: string;
  categorieCreate: number;
  controlliCreati: number;
  giaPresenti: { categorie: number; controlli: number };
  decisioni: { incluse: number; escluse: number };
  scadenzeCreate: number;
}
