// src/features/sistema/hooks/useAlertHistory.ts
//
// Storico degli allarmi con filtri e paginazione lato server (ADR038). Un
// cambio di filtri riporta alla prima pagina. La data "Al" include l'intera
// giornata scelta (fino alle 23:59:59.999), non solo la sua mezzanotte.
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@edg/ui';

import { getAlertHistory } from '../api/infoApi';
import type { AlertHistoryEntry } from '../types/info';

export const HISTORY_PAGE_SIZE = 64;

/** '' = nessun filtro su quel campo */
export interface AlertHistoryFilters {
  ruleId: string;
  status: '' | 'SENT' | 'FAILED';
  severity: '' | 'info' | 'warning' | 'critical';
  startDate?: Date;
  endDate?: Date;
}

export const EMPTY_HISTORY_FILTERS: AlertHistoryFilters = { ruleId: '', status: '', severity: '' };

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export function useAlertHistory() {
  const toast = useToast();
  const [filters, setFiltersState] = useState<AlertHistoryFilters>(EMPTY_HISTORY_FILTERS);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<AlertHistoryEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAlertHistory({
        ruleId: filters.ruleId || undefined,
        status: filters.status || undefined,
        severity: filters.severity || undefined,
        startDate: filters.startDate ? startOfDay(filters.startDate).toISOString() : undefined,
        endDate: filters.endDate ? endOfDay(filters.endDate).toISOString() : undefined,
        page,
        limit: HISTORY_PAGE_SIZE,
      });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      toast?.danger({ title: 'Impossibile caricare lo storico', description: (err as Error).message });
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const setFilters = useCallback((patch: Partial<AlertHistoryFilters>) => {
    setFiltersState(f => ({ ...f, ...patch }));
    setPage(0);
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(EMPTY_HISTORY_FILTERS);
    setPage(0);
  }, []);

  return { filters, setFilters, resetFilters, page, setPage, items, total, totalPages, isLoading, refetch: load };
}
