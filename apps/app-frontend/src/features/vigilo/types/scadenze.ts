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
  /** C'è una segnalazione dell'addetto da confermare (B9c) */
  segnalata: boolean;
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
  /** Segnalazione respinta: perché (B9c) */
  motivoRifiuto: string | null;
  /** L'ha inserita l'utente (l'addetto ritira solo le sue segnalazioni) */
  tua: boolean;
}

/** La segnalazione dell'addetto in attesa, con il nome di chi l'ha mandata (B9c) */
export interface SegnalazioneInAttesa extends Registrazione {
  da: string | null;
  /** Documenti allegati alla segnalazione */
  documenti: number;
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
  segnalazione: SegnalazioneInAttesa | null;
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
  /** Documenti caricati sulla scadenza dal modulo: passano alla registrazione (B9a) */
  allegati?: string[];
}

/** "Fatto" segnalato dall'addetto: solo ciò che può dare (B9c) */
export interface DatiSegnalazione {
  eseguitaIl: string;
  lettura?: number | null;
  note?: string | null;
  allegati?: string[];
}

/** La conferma dell'ufficio: i campi del modulo Registra, corretti se serve */
export type DatiConferma = Omit<DatiEsecuzione, 'esito' | 'dataNuova'>;

export interface DatiRinvio {
  dataNuova: string;
  motivo: string;
  note?: string | null;
}

export interface EsitoEsecuzione {
  successiva: { uuid: string; scadeIl: string | null; sogliaUso: number | null } | null;
}

// --- Elenco delle scadenze --------------------------------------------------

/** Quali scadenze: tutte le aperte, uno stato, quelle segnalate dall'addetto da confermare, o le chiuse (storiche) */
export type FiltroStatoScadenze = 'aperte' | Stato | 'segnalate' | 'chiuse';
export type OrdinaScadenze = 'urgenza' | 'scadeIl' | 'soggetto';
