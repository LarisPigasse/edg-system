// src/features/sistema/api/assistenzaApi.ts
//
// Accesso assistito (ADR085) su auth-service: /auth/assistenza.
import { authApi } from './authApi';
import type { AccountAssistibile, AperturaAssistenza, AperturaAssistenzaInput, Assistenza } from '../types/assistenza';

const RESOURCE = 'assistenza';

export const assistenzaApi = {
  /** Apre la sessione e restituisce il codice monouso per app-frontend */
  apri(input: AperturaAssistenzaInput) {
    return authApi.createResource<AperturaAssistenza, AperturaAssistenzaInput>(RESOURCE, input);
  },

  /** Account attivi del tenant, da scegliere per l'Assistenza (AA4) */
  account(tenantId: number) {
    return authApi.listResource<AccountAssistibile>(`${RESOURCE}/account`, { extra: { tenantId } });
  },

  /** Sessioni aperte, oppure le ultime 64 di ogni stato */
  elenco(aperte: boolean) {
    return authApi.listResource<Assistenza>(RESOURCE, { extra: { aperte: String(aperte) } });
  },

  /** Chiude una sessione aperta (da EDG) */
  chiudi(id: number) {
    return authApi.removeResource(RESOURCE, id);
  },
};
