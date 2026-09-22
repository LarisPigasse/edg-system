// src/shared/api/createResourceApi.ts

/**
 * Fabbrica del client REST generico per le risorse CRUD esposte dietro il
 * gateway (system-service su /api/system, auth-service su /auth, ...).
 * Riusa apiFetch (@edg/auth): Bearer token e refresh automatico su 401 sono
 * già gestiti lì. Ogni backend istanzia la propria fabbrica con il proprio
 * `basePath` — vedi features/base/api/systemApi.ts e
 * features/sistema/api/authApi.ts.
 */
import { apiFetch } from '@edg/auth';

import type { ApiResponse } from '../types/api';

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

/** Crea un client CRUD generico per le risorse esposte sotto `basePath`. */
export function createResourceApi(basePath: string) {
  return {
    listResource<T>(resource: string, params?: ListParams): Promise<ApiResponse<T[]>> {
      return apiFetch<ApiResponse<T[]>>(`${basePath}/${resource}${buildQuery(params)}`);
    },

    getResource<T>(resource: string, id: number): Promise<ApiResponse<T>> {
      return apiFetch<ApiResponse<T>>(`${basePath}/${resource}/${id}`);
    },

    createResource<T, I = Partial<T>>(resource: string, body: I): Promise<ApiResponse<T>> {
      return apiFetch<ApiResponse<T>>(`${basePath}/${resource}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },

    updateResource<T, I = Partial<T>>(resource: string, id: number, body: I): Promise<ApiResponse<T>> {
      return apiFetch<ApiResponse<T>>(`${basePath}/${resource}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    },

    /**
     * Elimina, o disattiva se il record è referenziato altrove: il backend
     * decide (tenta prima l'eliminazione vera, ripiega sulla disattivazione se
     * un vincolo FK la impedisce) e lo comunica nel campo `message` della
     * risposta — usarlo per il feedback all'utente invece di assumere l'esito.
     */
    removeResource(resource: string, id: number): Promise<ApiResponse<null>> {
      return apiFetch<ApiResponse<null>>(`${basePath}/${resource}/${id}`, { method: 'DELETE' });
    },

    toggleResourceActive<T>(resource: string, id: number): Promise<ApiResponse<T>> {
      return apiFetch<ApiResponse<T>>(`${basePath}/${resource}/${id}/toggle`, { method: 'PATCH' });
    },
  };
}

/** Client CRUD prodotto da {@link createResourceApi}. */
export type ResourceApi = ReturnType<typeof createResourceApi>;
