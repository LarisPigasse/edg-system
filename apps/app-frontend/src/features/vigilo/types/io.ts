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
}
