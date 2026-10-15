// src/features/vigilo/types/scadenze.ts — scadenze (vigilo-service, scadenza.presenta)
import type { Natura, TipoSoggetto } from './valori';

export const STATI = ['scaduta', 'in-tolleranza', 'in-scadenza', 'da-completare', 'in-regola'] as const;
export type Stato = (typeof STATI)[number];

export interface RiferimentoSoggetto {
  uuid: string;
  tipo: TipoSoggetto;
  nome: string;
  identificativo: string | null;
  /** Codici del servizio; a schermo: Attivo · Sospeso · Archiviato (constants/statiSoggetto) */
  stato: 'in-servizio' | 'fermo' | 'dismesso';
}

export interface Scadenza {
  uuid: string;
  titolo: string;
  soggetto: RiferimentoSoggetto | null;
  controllo: { uuid: string; nome: string; natura: Natura } | null;
  scadeIl: string | null;
  sogliaUso: number | null;
  contatore: Contatore | null;
  stato: Stato;
  /** Pronto da mostrare: "tra 8 giorni · 30 ott" */
  testo: string;
  limiteIl: string | null;
  stimataIl: string | null;
  urgenzaIl: string | null;
  chiusa: { il: string; motivo: string } | null;
  note: string | null;
}

export interface Contatore {
  uuid: string;
  unita: 'km' | 'ore';
  nome: string | null;
  valore: number | null;
  lettoIl: string | null;
  usoGiornaliero: number | null;
}

/** Filtri comuni a dashboard ed elenco */
export interface FiltriScadenze {
  testo?: string;
  tipo?: TipoSoggetto;
  natura?: Natura;
  sede?: string;
}

// --- Dettaglio e azioni (GET /scadenze/:id, registrazioni, rinvio) ----------

export type TipoRegistrazione = 'esecuzione' | 'rinvio' | 'rinnovo-tacito';
export type Esito = 'positivo' | 'negativo';

export interface Registrazione {
  uuid: string;
  tipo: TipoRegistrazione;
  stato: 'confermata' | 'da-confermare' | 'respinta';
  eseguitaIl: string;
  esito: Esito | null;
  dataPrecedente: string | null;
  dataNuova: string | null;
  lettura: number | null;
  /** Solo a chi ha vigilo.costi */
  importo?: number | null;
  fornitore: { uuid: string; nome: string } | null;
  riferimento: string | null;
  motivo: string | null;
  note: string | null;
  registrataIl: string;
}

/** Che cosa chiede la registrazione, dato per dato (dal controllo) */
export type Richiesta = 'obbligatorio' | 'facoltativo' | 'nascosto';
export type DatoRegistrazione = 'importo' | 'fornitore' | 'riferimento' | 'lettura' | 'allegato';

export interface DettaglioScadenza extends Scadenza {
  impostazioni: { frasi: { cadenza: string; preavvisi: string; tolleranza: string } };
  /** Le più recenti per prime */
  registrazioni: Registrazione[];
  /** La successiva che Vigilo propone se la si registra oggi (null: la serie finisce) */
  prossimaSeRegistrataOggi: { scadeIl: string | null; sogliaUso: number | null } | null;
  richieste: Record<DatoRegistrazione, Richiesta>;
  rinviabile: boolean;
}

export interface DatiEsecuzione {
  eseguitaIl: string;
  esito: Esito;
  lettura?: number | null;
  importo?: number | null;
  fornitore?: string | null;
  riferimento?: string | null;
  note?: string | null;
  /** Correzione della prossima proposta (esito positivo) */
  prossima?: { scadeIl?: string; sogliaUso?: number };
  /** Nuova data se l'esito è negativo */
  dataNuova?: string | null;
}

export interface DatiRinvio {
  dataNuova: string;
  motivo: string;
  note?: string | null;
}

export interface EsitoEsecuzione {
  successiva: { uuid: string; scadeIl: string | null; sogliaUso: number | null } | null;
}

// --- Elenco delle scadenze --------------------------------------------------

/** Quali scadenze: tutte le aperte, uno stato, o le chiuse (storiche) */
export type FiltroStatoScadenze = 'aperte' | Stato | 'chiuse';
export type OrdinaScadenze = 'urgenza' | 'scadeIl' | 'soggetto';
