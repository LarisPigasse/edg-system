// src/features/vigilo/types/valori.ts — elenchi strutturali, come in vigilo-service (domini/valori.ts)

export const TIPI_SOGGETTO = ['veicolo', 'macchina', 'attrezzatura', 'sede', 'persona', 'azienda'] as const;
export type TipoSoggetto = (typeof TIPI_SOGGETTO)[number];

export const NATURE = ['adempimento', 'manutenzione', 'abilitazione', 'documento', 'pagamento', 'promemoria'] as const;
export type Natura = (typeof NATURE)[number];
export type Rinnovo = 'conferma' | 'tacito';

export interface Frasi {
  cadenza: string;
  preavvisi: string;
  tolleranza: string;
}

export interface Preavvisi {
  giorni: number[];
  uso: number[];
}

export interface Tolleranza {
  giorni: number;
  uso: number;
}

export interface Predefiniti {
  preavvisi: Preavvisi;
  tolleranza: Tolleranza;
}
