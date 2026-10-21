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
  inizio: string;
  scade: string;
  fine: string | null;
  chiusaDa: number | null;
}

export interface AperturaAssistenzaInput {
  tenantId: number;
  modo: ModoAssistenza;
  motivo: string;
}

export interface AperturaAssistenza {
  codice: string;
  codiceValidoSecondi: number;
  sessione: Assistenza;
}
