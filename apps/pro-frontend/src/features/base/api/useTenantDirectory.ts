// src/features/base/api/useTenantDirectory.ts

/**
 * Elenco dei tenant (auth-service), con utility di lookup pronte per questa
 * feature: usato dal form anagrafiche (selettore tenant), dalla tabella
 * (colonna e filtro), dal dettaglio e dal collegamento cliente ↔ tenant
 * (ADR058). Un solo punto di caricamento, così le viste restano coerenti tra
 * loro — stesso principio di useEntityDirectory lato feature "sistema", solo
 * nella direzione opposta (qui servono i tenant, là servivano
 * operatori/anagrafiche).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from './authApi';

export interface TenantDirectoryEntry {
  id: number;
  name: string;
  isSystem: boolean;
  isActive: boolean;
  /** Cliente dell'anagrafica EDG collegato (ADR058) */
  clienteUuid: string | null;
}

export function useTenantDirectory() {
  // Tutti, anche i disattivati: un cliente collegato a un tenant disattivato
  // resta collegato. Selettori e filtri usano solo gli attivi (`tenants`).
  const [allTenants, setAllTenants] = useState<TenantDirectoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await authApi.listResource<TenantDirectoryEntry>('tenants', { active: 'all', limit: 100 });
      setAllTenants(res.data ?? []);
    } catch {
      setAllTenants([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const tenants = useMemo(() => allTenants.filter(t => t.isActive), [allTenants]);

  const getTenant = (id: number | null | undefined): TenantDirectoryEntry | null =>
    allTenants.find(t => t.id === id) ?? null;

  const getTenantName = (id: number | null | undefined): string | null => getTenant(id)?.name ?? null;

  /** Tenant collegato a un cliente dell'anagrafica EDG, se c'è (ADR058) */
  const tenantOfCliente = (uuid: string | null | undefined): TenantDirectoryEntry | null =>
    (uuid && allTenants.find(t => t.clienteUuid === uuid)) || null;

  return { tenants, allTenants, isLoading, refetch, getTenant, getTenantName, tenantOfCliente };
}
