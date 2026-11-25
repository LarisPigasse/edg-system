// src/features/sistema/types/datiModuli.ts — i dati di un tenant in un modulo (fase 3, ADR117)
// Il contratto che ogni modulo con dati espone (per Vigilo: domini/piattaforma di vigilo-service).

export type ModoEliminazione = 'tutto' | 'dati';

export interface RigaDati {
  tabella: string;
  etichetta: string;
  righe: number;
}

export interface RiepilogoDati {
  idTenant: number;
  /** Ha fatto la procedura di avvio del modulo */
  avviato: boolean;
  dati: RigaDati[];
  configurazione: RigaDati[];
  scadenze: { aperte: number; scadute: number };
  documenti: { numero: number; byte: number };
}

export interface EsitoEliminazione {
  idTenant: number;
  modo: ModoEliminazione;
  righe: Record<string, number>;
  totaleRighe: number;
  file: { tolti: number; nonTolti: number };
  /** Che cosa resta, in parole */
  resta: string;
}
