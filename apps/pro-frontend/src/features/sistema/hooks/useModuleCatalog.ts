// src/features/sistema/hooks/useModuleCatalog.ts — catalogo dei moduli (ADR048)
//
// Elenco, creazione/modifica ed eliminazione con i messaggi di esito. I
// rifiuti del backend (chiave già usata, dipendenza circolare, modulo già
// attivato…) arrivano già in italiano e vengono mostrati così come sono.
// L'aspetto (branding) si salva a parte, con la sua finestra.
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@edg/ui';
import type { ModuleBranding } from '@edg/ui';

import { createCatalogModule, deleteCatalogModule, listCatalog, updateCatalogModule } from '../api/moduleApi';
import type { CatalogModule, CatalogModuleInput } from '../types/modules';

export function useModuleCatalog() {
  const toast = useToast();
  const [items, setItems] = useState<CatalogModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await listCatalog());
    } catch (err) {
      toast?.danger({ title: 'Impossibile caricare il catalogo', description: (err as Error).message });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  /** Crea (key null) o modifica. true se riuscito, per chiudere la modale. */
  const save = useCallback(
    async (key: string | null, input: CatalogModuleInput): Promise<boolean> => {
      setIsSaving(true);
      try {
        const saved = key ? await updateCatalogModule(key, input) : await createCatalogModule(input);
        toast?.({ title: `Modulo "${saved.name}" ${key ? 'aggiornato' : 'aggiunto al catalogo'}` });
        await refetch();
        return true;
      } catch (err) {
        toast?.danger({ title: 'Salvataggio non riuscito', description: (err as Error).message });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refetch, toast]
  );

  /** Solo l'aspetto (ADR054). true se riuscito, per chiudere la modale. */
  const saveBranding = useCallback(
    async (key: string, branding: ModuleBranding): Promise<boolean> => {
      setIsSaving(true);
      try {
        const saved = await updateCatalogModule(key, { branding });
        toast?.({ title: `Aspetto di "${saved.name}" aggiornato` });
        await refetch();
        return true;
      } catch (err) {
        toast?.danger({ title: 'Salvataggio non riuscito', description: (err as Error).message });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refetch, toast]
  );

  const remove = useCallback(
    async (item: CatalogModule) => {
      try {
        await deleteCatalogModule(item.key);
        toast?.({ title: `Modulo "${item.name}" eliminato dal catalogo` });
        await refetch();
      } catch (err) {
        toast?.danger({ title: 'Eliminazione non riuscita', description: (err as Error).message });
      }
    },
    [refetch, toast]
  );

  return { items, isLoading, isSaving, refetch, save, saveBranding, remove };
}
