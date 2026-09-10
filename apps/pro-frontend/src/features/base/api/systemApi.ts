// src/features/base/api/systemApi.ts

/**
 * Client generico per le risorse esposte da system-service tramite il
 * gateway su /api/system/<risorsa>. Riusa apiFetch (@edg/auth): Bearer token
 * e refresh automatico su 401 sono già gestiti lì.
 */
import { apiFetch } from '@edg/auth';

import type { ApiResponse } from '../types';

const BASE_PATH = '/api/system';

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean | 'all';
  /** Filtri aggiuntivi specifici della risorsa (es. { tipo: 'cliente' }) */
  extra?: Record<string, string | number | boolean | undefined>;
}

function buildQuery(params?: ListParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.search) qs.set('search', params.search);
  if (params.active !== undefined) qs.set('active', String(params.active));
  if (params.extra) {
    for (const [key, value] of Object.entries(params.extra)) {
      if (value !== undefined && value !== '') qs.set(key, String(value));
    }
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export function listResource<T>(resource: string, params?: ListParams): Promise<ApiResponse<T[]>> {
  return apiFetch<ApiResponse<T[]>>(`${BASE_PATH}/${resource}${buildQuery(params)}`);
}

export function getResource<T>(resource: string, id: number): Promise<ApiResponse<T>> {
  return apiFetch<ApiResponse<T>>(`${BASE_PATH}/${resource}/${id}`);
}

export function createResource<T, I = Partial<T>>(resource: string, body: I): Promise<ApiResponse<T>> {
  return apiFetch<ApiResponse<T>>(`${BASE_PATH}/${resource}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateResource<T, I = Partial<T>>(resource: string, id: number, body: I): Promise<ApiResponse<T>> {
  return apiFetch<ApiResponse<T>>(`${BASE_PATH}/${resource}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Elimina, o disattiva se il record è referenziato altrove: il backend
 * decide (tenta prima l'eliminazione vera, ripiega sulla disattivazione se
 * un vincolo FK la impedisce) e lo comunica nel campo `message` della
 * risposta — usarlo per il feedback all'utente invece di assumere l'esito.
 */
export function removeResource(resource: string, id: number): Promise<ApiResponse<null>> {
  return apiFetch<ApiResponse<null>>(`${BASE_PATH}/${resource}/${id}`, { method: 'DELETE' });
}

export function toggleResourceActive<T>(resource: string, id: number): Promise<ApiResponse<T>> {
  return apiFetch<ApiResponse<T>>(`${BASE_PATH}/${resource}/${id}/toggle`, { method: 'PATCH' });
}
