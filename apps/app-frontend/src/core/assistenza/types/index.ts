// src/core/assistenza/types/index.ts
//
// Accessi dell'assistenza EDG visti dal cliente (AA5): stessa forma di
// AccessoAssistenzaCliente in auth-service. Del personale EDG solo il nome.

export type ModoAccesso = 'preparazione' | 'assistenza';
export type StatoAccesso = 'aperta' | 'uscita' | 'scaduta' | 'chiusa';

export interface AccessoAssistenza {
  uuid: string;
  modo: ModoAccesso;
  stato: StatoAccesso;
  motivo: string;
  /** Nome e cognome di chi è entrato ("Personale EDG" se mancano) */
  operatore: string;
  /** Solo in Assistenza: l'utente di cui si è vista la vista */
  perConto: string | null;
  inizio: string;
  scade: string;
  fine: string | null;
}
