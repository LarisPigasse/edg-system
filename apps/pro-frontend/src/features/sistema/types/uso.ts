// src/features/sistema/types/uso.ts — uso della piattaforma per tenant (fase 2 dei log, ADR117)
// Le risposte di GET /api/log/uso e /api/log/uso/tenant (log-service, services/uso.ts): date in ISO.

export interface UsoModulo {
  modulo: string;
  accessi: number;
  consultazioni: number;
  modifiche: number;
  persone: number;
  ultimoAccesso: string | null;
  ultimoUso: string | null;
}

export interface UsoPersona {
  /** origine.id dei log: l'id dell'account */
  accountId: string;
  email: string | null;
  accessi: number;
  consultazioni: number;
  modifiche: number;
  login: number;
  moduli: string[];
  ultimoUso: string | null;
}

/** Ciò che il personale EDG ha fatto nel tenant in accesso assistito: non è uso del cliente */
export interface UsoAssistenza {
  eventi: number;
  accessi: number;
  consultazioni: number;
  operatori: string[];
  ultimo: string | null;
}

export interface UsoTenant {
  tenantId: number;
  giorni: number;
  dal: string;
  al: string;
  moduli: UsoModulo[];
  persone: UsoPersona[];
  assistenza: UsoAssistenza;
}

export interface UltimoUsoTenant {
  tenantId: number;
  /** Ultimo uso di sempre: accesso, consultazione, modifica o login */
  ultimoUso: string | null;
  /** Nel periodo */
  accessi: number;
  persone: number;
}
