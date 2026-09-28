// src/features/base/api/useAccountDirectory.ts

/**
 * Elenco degli account (auth-service), con lookup per id pronto per questa
 * feature: usato dalla pagina Logs per risalire da origine.id (l'account che
 * ha generato l'evento) a accountType + entityId, e da li' al nome
 * leggibile tramite useEntityDirectory (operatore/anagrafica collegati).
 * Stesso principio di useTenantDirectory, solo su chiave id invece che su
 * un'altra risorsa gia' identificata per id (qui infatti la chiave è la
 * stessa, id numerico dell'account).
 */
import { useEffect, useState } from 'react';
import { authApi } from './authApi';

export interface AccountDirectoryEntry {
  id: number;
  email: string;
  accountType: string;
  entityId: string | null;
}

export function useAccountDirectory() {
  const [accounts, setAccounts] = useState<AccountDirectoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authApi
      .listResource<AccountDirectoryEntry>('accounts', { limit: 100 })
      .then(res => {
        if (!cancelled) setAccounts(res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setAccounts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const getAccount = (id: number | null | undefined): AccountDirectoryEntry | null =>
    accounts.find(a => a.id === id) ?? null;

  return { accounts, isLoading, getAccount };
}
