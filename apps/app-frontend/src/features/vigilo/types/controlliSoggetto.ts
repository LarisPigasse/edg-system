// src/features/vigilo/types/controlliSoggetto.ts
//
// I controlli di un soggetto e le decisioni di non seguirne qualcuno
// (revisione 2026-11-11): GET /soggetti/:id/controlli.
import type { Natura, TipoSoggetto } from './valori';

/** Un controllo attivo che vale per il soggetto */
export interface ControlloDelSoggetto {
  uuid: string;
  nome: string;
  natura: Natura;
  automatico: boolean;
  seguito: boolean;
  /** C'è una scadenza aperta di questo controllo per il soggetto */
  aperta: boolean;
  /** La decisione in corso, se non si segue */
  nonSeguito: { motivo: string; da: string | null; il: string } | null;
}

/** Una decisione dello storico: non seguire e, se c'è stata, la ripresa */
export interface DecisioneControllo {
  uuid: string;
  controllo: { uuid: string | null; nome: string };
  motivo: string;
  decisaDa: string | null;
  decisaIl: string;
  ripresaDa: string | null;
  ripresaIl: string | null;
  notaRipresa: string | null;
}

export interface ControlliSoggetto {
  controlli: ControlloDelSoggetto[];
  decisioni: DecisioneControllo[];
}

/** Una decisione nel report di tutta l'azienda (Configurazione): con il soggetto */
export interface DecisioneDelTenant extends DecisioneControllo {
  soggetto: { uuid: string | null; nome: string; tipo: TipoSoggetto | null; identificativo: string | null };
}

export type QualiDecisioni = 'in-corso' | 'tutte';

/** Che cosa è successo alla scadenza tornando a seguire il controllo */
export type EsitoRipresa = 'riapri' | 'genera' | 'niente';
