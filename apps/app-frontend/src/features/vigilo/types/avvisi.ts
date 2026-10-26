// src/features/vigilo/types/avvisi.ts — gli avvisi dell'utente e le sue preferenze (GET /api/vigilo/avvisi, ADR090, B8d-1)
import type { TipoSoggetto } from './valori';

/** inviato = da leggere · letto · risolto (non serve più) */
export type StatoConsegnaApp = 'inviato' | 'letto' | 'risolto';

/** Come i colori della dashboard: rosso, arancio ("Entro 8 giorni"), normale */
export type TonoAvviso = 'pericolo' | 'attenzione' | 'normale';

export interface VoceAvviso {
  uuid: string;
  /** Il testo intero, come nelle email */
  testo: string;
  /** Titolo della scadenza o del controllo */
  titolo: string;
  /** Lo stato alla nascita dell'avviso ("scade tra 2 giorni · 24 ott") */
  stato: string;
  tono: TonoAvviso;
  tipo: string;
  urgente: boolean;
  consegna: StatoConsegnaApp;
  /** ISO */
  creatoIl: string;
  scadenza: { uuid: string } | null;
  soggetto: { uuid: string; nome: string; identificativo: string | null; tipo: TipoSoggetto } | null;
}

export interface ElencoAvvisi {
  /** Da leggere in tutto, qualunque filtro */
  nonLetti: number;
  /** Quanti con i filtri scelti */
  totale: number;
  voci: VoceAvviso[];
}

/** Quali avvisi nell'elenco: tutti, da leggere, superati (la scadenza si è sistemata) */
export type StatoElencoAvvisi = 'tutti' | 'da-leggere' | 'non-attuali';

export interface FiltriAvvisi {
  stato: StatoElencoAvvisi;
  tipo?: TipoSoggetto;
}

// --- preferenze (GET/PUT/DELETE /api/vigilo/avvisi/preferenze) ---

export type FrequenzaAvvisi = 'riepilogo-giornaliero' | 'riepilogo-settimanale' | 'subito' | 'mai';

export interface PreferenzeAvvisi {
  frequenza: FrequenzaAvvisi;
  urgentiSubito: boolean;
  /** Vuoti = tutto; sedi per uuid */
  filtri: { tipi: TipoSoggetto[]; sedi: string[] };
}

/** Le regole del tenant che decidono quando partono le email (si cambiano in Configurazione) */
export interface RegoleEmailTenant {
  /** 'HH:MM' */
  orarioRiepilogo: string;
  /** 1 = lunedì ... 7 = domenica */
  giorniLavorativi: number[];
  silenzio: { dalle: string; alle: string };
}

export interface SedeAvvisi {
  uuid: string;
  nome: string;
  archiviata: boolean;
}

export interface SchedaPreferenzeAvvisi {
  preferenze: PreferenzeAvvisi;
  /** false = mai salvate: valgono le predefinite */
  salvate: boolean;
  predefinite: PreferenzeAvvisi;
  /** Riceve come ufficio: solo allora i filtri contano */
  comeUfficio: boolean;
  regole: RegoleEmailTenant;
  sedi: SedeAvvisi[];
  limiti: { sedi: number };
}
