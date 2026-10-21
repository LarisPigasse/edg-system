// src/features/vigilo/types/calendario.ts — GET /api/vigilo/calendario (ADR083)
import type { Scadenza } from './scadenze';

/** Una scadenza aperta nel giorno in cui arriva (la data, o la stima dall'uso se viene prima) */
export interface VoceCalendario extends Scadenza {
  giorno: string;
  /** Il giorno viene dalla stima dell'uso, non da una data */
  stimata: boolean;
}

export interface Calendario {
  oggi: string;
  dal: string;
  al: string;
  /** Aperte con la data prima del mese corrente */
  arretrato: number;
  voci: VoceCalendario[];
  /** Oltre 1024 voci nel periodo: le altre non sono arrivate */
  troncato: boolean;
}
