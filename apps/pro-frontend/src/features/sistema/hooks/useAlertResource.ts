// src/features/sistema/hooks/useAlertResource.ts
//
// Ciclo comune alle risorse della scheda Regole (ADR038): elenco, salvataggio
// (crea/modifica), attiva/disattiva ed eliminazione, con i messaggi di esito.
// Non riusa useEntityCrud: quello presuppone id numerici e il campo isActive
// delle risorse di auth/system-service, mentre log-service usa _id (ObjectId)
// ed enabled. useAlertRules e useAlertRecipients sono istanze sottili di
// questo hook.
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@edg/ui';

export interface AlertResourceApi<T, I> {
  list: () => Promise<T[]>;
  create: (input: I) => Promise<T>;
  update: (id: string, input: I) => Promise<T>;
  toggle: (id: string) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

interface Options<T, I> {
  api: AlertResourceApi<T, I>;
  /** Etichette per i messaggi: { one: 'Regola', gender: 'f' } */
  label: { one: string; gender: 'm' | 'f' };
  nameOf: (item: T) => string;
  enabledOf: (item: T) => boolean;
}

export function useAlertResource<T extends { _id: string }, I>({ api, label, nameOf, enabledOf }: Options<T, I>) {
  const toast = useToast();
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const o = label.gender === 'f' ? 'a' : 'o';

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await api.list());
    } catch (err) {
      toast?.danger({ title: `Impossibile caricare l'elenco`, description: (err as Error).message });
    } finally {
      setIsLoading(false);
    }
  }, [api, toast]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  /** Crea (id null) o modifica. Restituisce true se riuscito, per chiudere la modale. */
  const save = useCallback(
    async (id: string | null, input: I): Promise<boolean> => {
      setIsSaving(true);
      try {
        const saved = id ? await api.update(id, input) : await api.create(input);
        toast?.({ title: `${label.one} "${nameOf(saved)}" ${id ? `aggiornat${o}` : `creat${o}`}` });
        await refetch();
        return true;
      } catch (err) {
        toast?.danger({ title: 'Salvataggio non riuscito', description: (err as Error).message });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [api, label.one, nameOf, o, refetch, toast]
  );

  const toggle = useCallback(
    async (item: T) => {
      try {
        const saved = await api.toggle(item._id);
        toast?.({ title: `${label.one} "${nameOf(saved)}" ${enabledOf(saved) ? `attivat${o}` : `disattivat${o}`}` });
        await refetch();
      } catch (err) {
        toast?.danger({ title: 'Operazione non riuscita', description: (err as Error).message });
      }
    },
    [api, enabledOf, label.one, nameOf, o, refetch, toast]
  );

  const remove = useCallback(
    async (item: T) => {
      try {
        await api.remove(item._id);
        toast?.({ title: `${label.one} "${nameOf(item)}" eliminat${o}` });
        await refetch();
      } catch (err) {
        toast?.danger({ title: 'Eliminazione non riuscita', description: (err as Error).message });
      }
    },
    [api, label.one, nameOf, o, refetch, toast]
  );

  return { items, isLoading, isSaving, refetch, save, toggle, remove };
}
