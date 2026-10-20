// packages/auth/src/hooks/useEdgUser.ts
//
// L'utente collegato nella forma che @edg/ui mostra nell'header (EdgUser,
// ADR081): nome e cognome (o, se mancano, il nome ricavato dall'email),
// il tenant come entità e le iniziali. Le applicazioni lo passano nella
// configurazione del design system (EdgConfigProvider).
import { useMemo } from 'react';
import type { EdgUser } from '@edg/ui';

import { useAuth } from './useAuth';

export function useEdgUser(): EdgUser | null {
  const { isAuthenticated, account, getDisplayName, getUserInitials } = useAuth();

  return useMemo(
    () =>
      isAuthenticated && account
        ? { name: getDisplayName(), entity: account.tenantName ?? null, initials: getUserInitials() }
        : null,
    [isAuthenticated, account, getDisplayName, getUserInitials]
  );
}

export default useEdgUser;
