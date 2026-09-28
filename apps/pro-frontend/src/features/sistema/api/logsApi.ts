// src/features/sistema/api/logsApi.ts

/**
 * Client verso log-service tramite il gateway su /api/log — log azioni
 * (audit trail). Non passa dalla fabbrica generica createResourceApi:
 * log-service risponde con il body "nudo" (nessun inviluppo { success,
 * data } di auth-service, vedi logController.ts) e le operazioni non sono
 * CRUD su una collezione (ricerca con paginazione server-side, statistiche
 * aggregate, elenco utenti distinti) — stesso schema già usato in questa
 * feature per chiamate che non si prestano al client generico (vedi
 * accountActions.ts). Riusa comunque apiFetch (@edg/auth): stesso Bearer
 * token e refresh automatico su 401 di tutte le altre chiamate.
 */
import { apiFetch } from '@edg/auth';

import type { AzioneLog, LogSearchParams, LogSearchResult, LogStatistiche } from '../types';

const BASE_PATH = '/api/log';

function buildQuery(params?: object): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

/** GET /api/log/azioni — ricerca log con filtri e paginazione server-side. */
export function cercaLogs(params: LogSearchParams): Promise<LogSearchResult> {
  return apiFetch<LogSearchResult>(`${BASE_PATH}/azioni${buildQuery(params)}`);
}

/** GET /api/log/azioni/:id — dettaglio di un singolo evento. */
export function getLog(id: string): Promise<AzioneLog> {
  return apiFetch<AzioneLog>(`${BASE_PATH}/azioni/${id}`);
}

/**
 * GET /api/log/statistiche — accetta gli stessi filtri di cercaLogs
 * (page/limit non hanno effetto lato backend, qui non sono neanche
 * proposti). Vedi il commento su LogStatistiche.bySeverity in types/index.ts
 * prima di mostrare quel dato in UI.
 */
export function getLogStatistiche(
  params?: Omit<LogSearchParams, 'page' | 'limit'>
): Promise<LogStatistiche> {
  return apiFetch<LogStatistiche>(`${BASE_PATH}/statistiche${buildQuery(params)}`);
}

/** GET /api/log/utenti — utenti distinti presenti nei log, per popolare il filtro. */
export function getLogUtenti(): Promise<string[]> {
  return apiFetch<string[]>(`${BASE_PATH}/utenti`);
}
