// src/features/sistema/types/assistenza.ts
//
// Accesso assistito (ADR085): sessioni con cui il personale EDG entra nel
// tenant di un cliente. Stessa forma di AssistenzaView in auth-service.

export type ModoAssistenza = 'preparazione' | 'assistenza';
export type StatoAssistenza = 'aperta' | 'uscita' | 'scaduta' | 'chiusa';

export interface Assistenza {
  id: number;
  uuid: string;
  modo: ModoAssistenza;
  stato: StatoAssistenza;
  motivo: string;
  operatore: { id: number; email: string; nome: string } | null;
  tenant: { id: number; nome: string } | null;
  /** Solo in Assistenza: l'utente di cui si è vista la vista (AA4) */
  perConto: { id: number; email: string; nome: string } | null;
  inizio: string;
  scade: string;
  fine: string | null;
  chiusaDa: number | null;
}

export interface AperturaAssistenzaInput {
  tenantId: number;
  modo: ModoAssistenza;
  motivo: string;
  /** Obbligatorio in Assistenza, vietato in Preparazione */
  perConto?: number;
}

/** Un account attivo del tenant che si può scegliere per l'Assistenza (AA4) */
export interface AccountAssistibile {
  id: number;
  email: string;
  nome: string;
  ruolo: string | null;
}

export interface AperturaAssistenza {
  codice: string;
  codiceValidoSecondi: number;
  sessione: Assistenza;
}
