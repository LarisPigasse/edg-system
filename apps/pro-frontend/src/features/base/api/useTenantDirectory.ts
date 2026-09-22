// src/features/base/api/useTenantDirectory.ts

/**
 * Elenco dei tenant (auth-service), con utility di lookup pronte per questa
 * feature: usato dal form anagrafiche (selettore tenant), dalla tabella
 * (colonna e filtro) e dal dettaglio. Un solo punto di caricamento, così le
 * viste restano coerenti tra loro — stesso principio di useEntityDirectory
 * lato feature "sistema", solo nella direzione opposta (qui servono i
 * tenant, là servivano operatori/anagrafiche).
 */
import { useEffect, useState } from 'react';
import { authApi } from './authApi';

export interface TenantDirectoryEntry {
  id: number;
  name: string;
  isSystem: boolean;
}

export function useTenantDirectory() {
  const [tenants, setTenants] = useState<TenantDirectoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authApi
      .listResource<TenantDirectoryEntry>('tenants', { active: true, limit: 100 })
      .then(res => {
        if (!cancelled) setTenants(res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setTenants([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const getTenant = (id: number | null | undefined): TenantDirectoryEntry | null =>
    tenants.find(t => t.id === id) ?? null;

  const getTenantName = (id: number | null | undefined): string | null => getTenant(id)?.name ?? null;

  return { tenants, isLoading, getTenant, getTenantName };
}
