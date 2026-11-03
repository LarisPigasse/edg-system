// src/features/sistema/api/vigiloApi.ts
//
// Vigilo visto da EDG Pro: la libreria di EDG, per scegliere i settori
// suggeriti all'attivazione del modulo per un cliente (ADR087), e il catalogo
// dei tipi di fornitore comune a tutti i tenant, che cambia solo root (F0).
import { apiFetch } from '@edg/auth';

import { createResourceApi } from '../../../shared/api/createResourceApi';
import type { ApiResponse } from '../../../shared/types/api';
import type { TipoFornitore } from '../types/vigilo';

const api = createResourceApi('/api/vigilo');

export interface ModelloLibreria {
  chiave: string;
  nome: string;
  descrizione: string | null;
  /** Sempre proposto nella procedura di avvio (es. Base aziendale) */
  sempreProposto: boolean;
}

const TIPI = 'fornitori/tipi';
const tipo = (chiave: string) => `/api/vigilo/${TIPI}/${encodeURIComponent(chiave)}`;

export const vigiloApi = {
  modelli: () => api.listResource<ModelloLibreria>('libreria/modelli'),

  /** Per root tutti i tipi, anche disattivati, con quanti fornitori li usano in tutti i tenant */
  tipiFornitore: () => api.listResource<TipoFornitore>(TIPI),
  creaTipoFornitore: (nome: string) => api.createResource<TipoFornitore, { nome: string }>(TIPI, { nome }),
  modificaTipoFornitore: (chiave: string, dati: Partial<Pick<TipoFornitore, 'nome' | 'attivo'>>) =>
    apiFetch<ApiResponse<TipoFornitore>>(tipo(chiave), { method: 'PATCH', body: JSON.stringify(dati) }),
  /** Solo se nessun fornitore lo usa (altrimenti 409: si disattiva) */
  eliminaTipoFornitore: (chiave: string) => apiFetch<ApiResponse<null>>(tipo(chiave), { method: 'DELETE' }),
};
