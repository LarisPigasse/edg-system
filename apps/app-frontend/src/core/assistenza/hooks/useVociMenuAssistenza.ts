// src/core/assistenza/hooks/useVociMenuAssistenza.ts
//
// La voce "Accessi dell'assistenza EDG" del menu utente, solo per chi ha il
// permesso account.assistenze (l'amministratore del cliente).
import { useMemo } from 'react';
import { useAuth, type UserMenuItem } from '@edg/auth';
import { ShieldCheck } from '@edg/ui';

import { ACCESSI_ASSISTENZA_PATH, PERMESSO_ACCESSI_ASSISTENZA } from '../constants';

export function useVociMenuAssistenza(): UserMenuItem[] {
  const { hasPermission } = useAuth();
  const puo = hasPermission(PERMESSO_ACCESSI_ASSISTENZA);
  return useMemo(
    () =>
      puo
        ? [
            {
              key: 'accessi-assistenza',
              label: "Accessi dell'assistenza EDG",
              description: 'Quando EDG è entrato nel tuo spazio',
              icon: ShieldCheck,
              path: ACCESSI_ASSISTENZA_PATH,
            },
          ]
        : [],
    [puo]
  );
}
