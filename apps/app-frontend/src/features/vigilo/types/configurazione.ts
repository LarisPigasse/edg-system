// src/features/vigilo/types/configurazione.ts — categorie e controlli del cliente
import type { Cadenza } from './cadenza';
import type { Destinatario } from './destinatari';
import type { Frasi, Natura, Preavvisi, Rinnovo, TipoSoggetto, Tolleranza } from './valori';
import type { DatoRegistrazione, Richiesta } from './scadenze';

/** Un campo in più che la categoria chiede ai suoi soggetti */
export interface CampoAggiuntivo {
  chiave: string;
  etichetta: string;
  tipo: 'testo' | 'numero' | 'data' | 'elenco' | 'si-no';
  opzioni?: string[];
  obbligatorio: boolean;
  ordine: number;
}

export interface RiferimentoCategoria {
  uuid: string;
  nome: string;
  icona: string | null;
}

export interface Categoria {
  uuid: string;
  tipoSoggetto: TipoSoggetto;
  nome: string;
  descrizione: string | null;
  icona: string | null;
  ordine: number;
  attiva: boolean;
  contatori: ('km' | 'ore')[];
  campi: CampoAggiuntivo[];
  libreria: { chiave: string; versione: number } | null;
  /** Della libreria ma cambiata dal cliente (2026-11-19) */
  personalizzata?: boolean;
  /** Nessun soggetto e nessun controllo che vale solo per lei: si può eliminare */
  eliminabile?: boolean;
  soggetti?: number;
  controlli?: number;
}

export interface Controllo {
  uuid: string;
  nome: string;
  descrizione: string | null;
  riferimentoNormativo: string | null;
  natura: Natura;
  tipoSoggetto: TipoSoggetto;
  automatico: boolean;
  cadenza: Cadenza;
  preavvisi: Preavvisi;
  tolleranza: Tolleranza;
  /** Chi riceve gli avvisi delle sue scadenze (B8d-3) */
  destinatari: Destinatario[];
  rinnovo: Rinnovo;
  rinviabile: boolean;
  /** Avvisa anche col soggetto sospeso */
  avvisaAncheSeFermo: boolean;
  /** Che cosa chiede la registrazione, dato per dato; i dati assenti seguono la natura */
  registrazione: Partial<Record<DatoRegistrazione, Richiesta>>;
  ordine: number;
  attivo: boolean;
  categorie: RiferimentoCategoria[];
  frasi: Frasi;
  libreria: { chiave: string; versione: number; versioneIgnorata: number | null } | null;
  /** Della libreria ma cambiato dal cliente (2026-11-19) */
  personalizzato?: boolean;
  /** Nessuna scadenza, nemmeno chiusa: si può eliminare */
  eliminabile?: boolean;
  scadenzeAperte?: number;
}
