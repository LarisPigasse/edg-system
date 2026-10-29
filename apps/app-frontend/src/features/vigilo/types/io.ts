// src/features/vigilo/types/io.ts — GET /api/vigilo/me

export interface Capacita {
  config: boolean;
  write: boolean;
  read: boolean;
  costi: boolean;
  own: boolean;
}

export interface ProfiloVigilo {
  accountId: number;
  tenantId: number;
  systemTenant: boolean;
  capacita: Capacita;
  usaVigilo: boolean;
  /** ISO; null = procedura di avvio da fare */
  avviatoIl: string | null;
  /** La persona di cui l'utente è l'addetto */
  persona: { uuid: string; nome: string; stato: string } | null;
  /** ADR088: chi prepara Vigilo, scelto da EDG all'attivazione */
  preparazione: 'cliente' | 'edg';
  /** ADR088: l'utente può fare la procedura di avvio (oltre al permesso di configurazione) */
  puoAvviare: boolean;
  /** Accesso assistito in corso (ADR085) */
  inAssistenza: boolean;
  /** Giorni proposti per riparare un guasto che non blocca l'uso (parametro del tenant) */
  giorniRiparazione: number;
}
