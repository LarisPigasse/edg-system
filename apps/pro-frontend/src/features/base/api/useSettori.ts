// src/features/base/api/useSettori.ts

/**
 * Elenco dei settori di attività (ADR059, tabella di base di system-service)
 * per selettori, colonne e filtri. Carica anche i disattivati: un'anagrafica
 * che ne ha uno deve continuare a mostrarne il nome; i selettori propongono
 * solo gli attivi (più quello eventualmente già scelto).
 */
import { useEffect, useState } from 'react';
import type { SelectOption } from '@edg/ui';

import { systemApi } from './systemApi';
import type { Settore } from '../types';

export function useSettori() {
  const [settori, setSettori] = useState<Settore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    systemApi
      .listResource<Settore>('settori', { active: 'all', limit: 100 })
      .then(res => {
        if (!cancelled) setSettori(res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setSettori([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const settoreName = (id: number | null | undefined): string | null =>
    settori.find(s => s.idSettore === id)?.settore ?? null;

  /** Opzioni per un selettore: gli attivi, più quello già scelto anche se disattivato */
  const settoreOptions = (current?: number | null): SelectOption[] =>
    settori
      .filter(s => s.isActive || s.idSettore === current)
      .map(s => ({ value: String(s.idSettore), label: s.isActive ? s.settore : `${s.settore} (disattivato)` }));

  return { settori, isLoading, settoreName, settoreOptions };
}
