// src/features/sistema/hooks/useTenantModules.ts — moduli di un tenant (ADR048)
//
// Carica la vista "catalogo visto dal tenant" e applica attivazioni e
// modifiche. Se una modifica fa cadere altri moduli per dipendenza (es.
// sospendendo Spedizioni cade Tracking) lo dice esplicitamente.
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@edg/ui';

import { activateModule, getTenantModules, updateActivation } from '../api/moduleApi';
import type { ActivationCreateInput, ActivationUpdateInput, TenantModules } from '../types/modules';

export function useTenantModules(tenantId: number | null) {
  const toast = useToast();
  const [data, setData] = useState<TenantModules | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const refetch = useCallback(async () => {
    // Nessun tenant (finestra chiusa): niente dati vecchi alla prossima apertura
    if (!tenantId) {
      setData(null);
      return;
    }
    setIsLoading(true);
    try {
      setData(await getTenantModules(tenantId));
    } catch (err) {
      toast?.danger({ title: 'Impossibile caricare i moduli', description: (err as Error).message });
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, toast]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const nameOf = useCallback(
    (key: string) => data?.modules.find(m => m.module.key === key)?.module.name ?? key,
    [data]
  );

  /** Nuova attivazione (prova o attivo). true se riuscita. */
  const activate = useCallback(
    async (input: ActivationCreateInput): Promise<boolean> => {
      if (!tenantId) return false;
      setIsSaving(true);
      try {
        await activateModule(tenantId, input);
        toast?.({ title: `${nameOf(input.module)}: ${input.status === 'prova' ? 'prova avviata' : 'modulo attivato'}` });
        await refetch();
        return true;
      } catch (err) {
        toast?.danger({ title: 'Attivazione non riuscita', description: (err as Error).message });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [nameOf, refetch, tenantId, toast]
  );

  /** Modifica di un'attivazione esistente. true se riuscita. */
  const update = useCallback(
    async (key: string, input: ActivationUpdateInput, successTitle: string): Promise<boolean> => {
      if (!tenantId) return false;
      setIsSaving(true);
      try {
        const { lostModules } = await updateActivation(tenantId, key, input);
        toast?.({
          title: successTitle,
          description:
            lostModules.length > 0
              ? `Non più in vigore per dipendenza: ${lostModules.map(nameOf).join(', ')}`
              : undefined,
        });
        await refetch();
        return true;
      } catch (err) {
        toast?.danger({ title: 'Modifica non riuscita', description: (err as Error).message });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [nameOf, refetch, tenantId, toast]
  );

  return { data, isLoading, isSaving, refetch, activate, update };
}
