// src/features/vigilo/types/dashboard.ts — GET /api/vigilo/dashboard (vista "Da fare")
import type { Stato } from './scadenze';
import type { TipoSoggetto } from './valori';

export interface Conteggi {
  scadute: number;
  inTolleranza: number;
  entro8: number;
  entro32: number;
  inScadenza: number;
  daCompletare: number;
  inRegola: number;
  totale: number;
}

export interface Dashboard {
  oggi: string;
  conteggi: Conteggi;
  /** Le scadenze da fare per controllo, dalla più grave */
  /** Per nome: i controlli omonimi (es. i tagliandi di categorie diverse) sono una riga sola */
  /** Senza controllo: "Riparazioni" (natura riparazione, i guasti) e "Promemoria" */
  perControllo: { uuids: string[]; nome: string; natura: 'riparazione' | null; n: number; peggiore: Stato }[];
  /** Mesi 'YYYY-MM' dal corrente in avanti, più quelle rimaste indietro */
  perMese: { arretrato: number; mesi: { mese: string; n: number }[] };
  soggetti: { tipo: TipoSoggetto; n: number; peggiore: Stato | null; critici: number }[];
  /** Ultimi 12 mesi: esecuzioni con una data da rispettare, e quante entro quella data */
  fatteInTempo: { mese: string; totale: number; inTempo: number }[];
  /** Scadenze aperte con una segnalazione dell'addetto da confermare (B9c) */
  daConfermare: number;
}

/** Le due viste della dashboard */
export type VistaDashboard = 'fare' | 'spese';
