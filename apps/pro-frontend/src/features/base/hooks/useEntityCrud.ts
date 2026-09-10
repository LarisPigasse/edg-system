// src/features/base/hooks/useEntityCrud.ts
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@edg/ui';

import {
  listResource,
  createResource,
  updateResource,
  removeResource,
  toggleResourceActive,
  type ListParams,
} from '../api/systemApi';
import type { ApiResponse } from '../types';

/** Filtro stato: 'active' (default) = solo attivi, 'inactive' = solo non attivi, 'all' = tutti. */
export type StatusFilter = 'active' | 'inactive' | 'all';

interface UseEntityCrudOptions {
  /** Nome della risorsa nel path (es. 'reparti', 'operatori', 'anagrafiche') */
  resource: string;
  /** Etichetta human-readable per i messaggi (es. 'Reparto', 'Operatore') */
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
 * Centralizza fetch/create/update/delete/toggle per una risorsa di
 * system-service. Le pagine specifiche portano solo colonne e form: la
 * gestione di stato, loading ed errori (via toast) è qui, una volta sola.
 */
export function useEntityCrud<T extends { isActive: boolean }>({
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

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res: ApiResponse<T[]> = await listResource<T>(resource, {
        active: statusFilter === 'all' ? 'all' : statusFilter === 'active',
        search: search || undefined,
        extra: extraFilters,
        limit: 100,
      });
      setItems(res.data ?? []);
    } catch (err) {
      toast?.danger({ title: `Impossibile caricare ${label.toLowerCase()}`, description: (err as Error).message });
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, label, statusFilter, search, JSON.stringify(extraFilters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = useCallback(
    async <I,>(body: I): Promise<boolean> => {
      setIsSaving(true);
      try {
        await createResource<T, I>(resource, body);
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
    [resource, label, refetch, toast]
  );

  const update = useCallback(
    async <I,>(id: number, body: I): Promise<boolean> => {
      setIsSaving(true);
      try {
        await updateResource<T, I>(resource, id, body);
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
    [resource, label, refetch, toast]
  );

  const remove = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const res = await removeResource(resource, id);
        // Il backend dice se ha eliminato davvero o solo disattivato
        // (referenziato altrove): il messaggio riflette l'esito reale.
        toast?.({ title: res.message ?? `${label} rimosso` });
        await refetch();
        return true;
      } catch (err) {
        toast?.danger({ title: `Errore nella rimozione`, description: (err as Error).message });
        return false;
      }
    },
    [resource, label, refetch, toast]
  );

  const toggleActive = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        await toggleResourceActive(resource, id);
        await refetch();
        return true;
      } catch (err) {
        toast?.danger({ title: `Errore nel cambio di stato`, description: (err as Error).message });
        return false;
      }
    },
    [resource, refetch, toast]
  );

  return { items, isLoading, isSaving, refetch, create, update, remove, toggleActive };
}
