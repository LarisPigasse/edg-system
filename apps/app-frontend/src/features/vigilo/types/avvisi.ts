// src/features/vigilo/types/avvisi.ts — gli avvisi dell'utente (GET /api/vigilo/avvisi, ADR090)

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
  soggetto: { uuid: string; nome: string; identificativo: string | null } | null;
}

export interface ElencoAvvisi {
  nonLetti: number;
  voci: VoceAvviso[];
}
