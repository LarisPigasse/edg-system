// src/features/sistema/api/vigiloApi.ts
//
// Vigilo visto da EDG Pro (ADR087): solo la libreria di EDG, per scegliere i
// settori suggeriti all'attivazione del modulo per un cliente.
import { createResourceApi } from '../../../shared/api/createResourceApi';

const api = createResourceApi('/api/vigilo');

export interface ModelloLibreria {
  chiave: string;
  nome: string;
  descrizione: string | null;
  /** Sempre proposto nella procedura di avvio (es. Base aziendale) */
  sempreProposto: boolean;
}

export const vigiloApi = {
  modelli: () => api.listResource<ModelloLibreria>('libreria/modelli'),
};
