// src/features/vigilo/types/configurazione.ts — categorie e controlli del cliente
import type { Cadenza } from './cadenza';
import type { Frasi, Natura, Preavvisi, Rinnovo, TipoSoggetto, Tolleranza } from './valori';

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
  rinnovo: Rinnovo;
  rinviabile: boolean;
  ordine: number;
  attivo: boolean;
  categorie: RiferimentoCategoria[];
  frasi: Frasi;
  libreria: { chiave: string; versione: number; versioneIgnorata: number | null } | null;
  scadenzeAperte?: number;
}
