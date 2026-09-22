// src/shared/hooks/useEntityCrud.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@edg/ui';

import type { ResourceApi, ListParams } from '../api/createResourceApi';
import type { ApiResponse } from '../types/api';

/** Filtro stato: 'active' (default) = solo attivi, 'inactive' = solo non attivi, 'all' = tutti. */
export type StatusFilter = 'active' | 'inactive' | 'all';

interface UseEntityCrudOptions {
  /** Client CRUD verso il backend giusto (system-service, auth-service, ...) —
   * vedi createResourceApi. Esplicito e non un default silenzioso: quale
   * backend viene interrogato deve essere sempre leggibile dal chiamante. */
  api: ResourceApi;
  /** Nome della risorsa nel path (es. 'reparti', 'operatori', 'tenants') */
  resource: string;
  /** Etichetta human-readable per i messaggi (es. 'Reparto', 'Tenant') */
  label: string;
  /** Default: 'active' (solo attivi). Le tabelle con pochi record possono
   * fissarlo su 'all' per mostrare sempre tutto; le altre lo pilotano da
   * un filtro in pagina. */
  statusFilter?: StatusFilter;
  /** Filtri aggiuntivi specifici della risorsa, ricalcolati ad ogni cambio */
  extraFilters?: ListParams['extra'];
  search?: string;
}

/**
 * Centralizza fetch/create/update/delete/toggle per una risorsa CRUD dietro
 * il gateway. Le pagine specifiche portano solo colonne e form: la
 * gestione di stato, loading ed errori (via toast) è qui, una volta sola —
 * indipendentemente dal backend che la risorsa espone (`api`).
 */
export function useEntityCrud<T extends { isActive: boolean }>({
  api,
  resource,
  label,
  statusFilter = 'active',
  extraFilters,
  search,
}: UseEntityCrudOptions) {
  const toast = useToast();
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // True per tutta la vita del componente montato. Evita che una richiesta
  // di caricamento ormai superata (per smontaggio, o per il doppio effetto
  // di React StrictMode in sviluppo) aggiorni ancora stato o mostri ancora
  // un toast - altrimenti un solo fallimento genera due notifiche identiche.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: ApiResponse<T[]> = await api.listResource<T>(resource, {
        active: statusFilter === 'all' ? 'all' : statusFilter === 'active',
        search: search || undefined,
        extra: extraFilters,
        limit: 100,
      });
      if (isMountedRef.current) setItems(res.data ?? []);
    } catch (err) {
      if (isMountedRef.current) {
        toast?.danger({ title: `Impossibile caricare ${label.toLowerCase()}`, description: (err as Error).message });
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, resource, label, statusFilter, search, JSON.stringify(extraFilters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = useCallback(
    async <I,>(body: I): Promise<boolean> => {
      setIsSaving(true);
      try {
        await api.createResource<T, I>(resource, body);
        toast?.({ title: `${label} creato con successo` });
        await refetch();
        return true;
      } catch (err) {
        toast?.danger({ title: `Errore nella creazione`, description: (err as Error).message });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [api, resource, label, refetch, toast]
  );

  const update = useCallback(
    async <I,>(id: number, body: I): Promise<boolean> => {
      setIsSaving(true);
      try {
        await api.updateResource<T, I>(resource, id, body);
        toast?.({ title: `${label} aggiornato con successo` });
        await refetch();
        return true;
      } catch (err) {
        toast?.danger({ title: `Errore nell'aggiornamento`, description: (err as Error).message });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [api, resource, label, refetch, toast]
  );

  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const res = await api.removeResource(resource, id);
        // Il backend dice se ha eliminato davvero o solo disattivato
        // (referenziato altrove, o protetto): il messaggio riflette l'esito reale.
        toast?.({ title: res.message ?? `${label} rimosso` });
        await refetch();
        return true;
      } catch (err) {
        toast?.danger({ title: `Errore nella rimozione`, description: (err as Error).message });
        return false;
      }
    },
    [api, resource, label, refetch, toast]
  );

  const toggleActive = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await api.toggleResourceActive(resource, id);
        await refetch();
        return true;
      } catch (err) {
        toast?.danger({ title: `Errore nel cambio di stato`, description: (err as Error).message });
        return false;
      }
    },
    [api, resource, refetch, toast]
  );

  return { items, isLoading, isSaving, refetch, create, update, remove, toggleActive };
}
