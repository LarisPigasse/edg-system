// src/features/vigilo/types/valori.ts — elenchi strutturali, come in vigilo-service (domini/valori.ts)

export const TIPI_SOGGETTO = ['veicolo', 'macchina', 'attrezzatura', 'sede', 'persona', 'azienda'] as const;
export type TipoSoggetto = (typeof TIPI_SOGGETTO)[number];

export const NATURE = ['adempimento', 'manutenzione', 'abilitazione', 'documento', 'pagamento', 'promemoria'] as const;
export type Natura = (typeof NATURE)[number];
/** Natura propria delle scadenze senza controllo: il guasto (passo 8) */
export const NATURE_SCADENZA = ['riparazione'] as const;
/** La natura di una scadenza come si vede: propria, del controllo o promemoria */
export type NaturaEffettiva = Natura | (typeof NATURE_SCADENZA)[number];
/** Nei filtri di elenco, dashboard e calendario */
export const NATURE_FILTRO: readonly NaturaEffettiva[] = [...NATURE, ...NATURE_SCADENZA];
/** I soggetti su cui si segnala un guasto (come vigilo-service) */
export const TIPI_CON_GUASTI: readonly TipoSoggetto[] = ['veicolo', 'macchina', 'attrezzatura', 'sede'];
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
