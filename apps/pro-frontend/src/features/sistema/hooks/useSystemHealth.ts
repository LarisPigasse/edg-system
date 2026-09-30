// src/features/sistema/hooks/useSystemHealth.ts
//
// Stato di salute della piattaforma con aggiornamento periodico (ADR038).
//  - Il backend ricalcola lo stato ogni 32 s; qui si legge ogni 16 s (la
//    lettura e' istantanea: snapshot gia' pronto nell'HealthMonitor).
//  - Lo scheletro di caricamento e' solo per il primo caricamento: gli
//    aggiornamenti successivi sostituiscono i dati senza sfarfallii (il
//    vecchio useSystem ricadeva nello stato di loading a ogni giro per una
//    closure ferma sul primo render).
//  - Con la finestra nascosta il polling si sospende; al ritorno riparte
//    subito con una lettura immediata.
//  - refresh() (pulsante di aggiornamento) non si limita a rileggere: chiede
//    a log-service di eseguire subito un giro di controlli (POST), cosi'
//    "ultimo controllo" riparte davvero da quel momento.
import { useCallback, useEffect, useRef, useState } from 'react';

import { checkSystemHealthNow, getSystemHealth } from '../api/infoApi';
import type { SystemHealth } from '../types/info';

export const HEALTH_POLL_MS = 16000;

interface UseSystemHealthResult {
  data: SystemHealth | null;
  /** Solo il primo caricamento */
  isLoading: boolean;
  /** Qualunque lettura in corso (per l'icona di refresh) */
  isFetching: boolean;
  error: string | null;
  refresh: () => void;
}

export function useSystemHealth(): UseSystemHealthResult {
  const [data, setData] = useState<SystemHealth | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async (checkNow = false) => {
    setIsFetching(true);
    try {
      const result = checkNow ? await checkSystemHealthNow() : await getSystemHealth();
      if (!mounted.current) return;
      setData(result);
      setError(null);
    } catch (err) {
      if (mounted.current) setError((err as Error).message || 'Impossibile leggere lo stato dei servizi');
    } finally {
      if (mounted.current) setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (timer) return;
      void load();
      timer = setInterval(() => void load(), HEALTH_POLL_MS);
    };
    const stopPolling = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const onVisibility = () => (document.hidden ? stopPolling() : startPolling());

    startPolling();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      mounted.current = false;
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [load]);

  return { data, isLoading: data === null && error === null, isFetching, error, refresh: () => void load(true) };
}
