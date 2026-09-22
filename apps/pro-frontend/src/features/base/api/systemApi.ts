// src/features/base/api/systemApi.ts

/**
 * Client verso le risorse esposte da system-service tramite il gateway su
 * /api/system/<risorsa>. Istanzia la fabbrica generica (shared/api) con il
 * basePath di questo backend — vedi features/sistema/api/authApi.ts per
 * l'equivalente su auth-service.
 */
import { createResourceApi } from '../../../shared/api/createResourceApi';

export type { ListParams } from '../../../shared/api/createResourceApi';

export const systemApi = createResourceApi('/api/system');

export const { listResource, getResource, createResource, updateResource, removeResource, toggleResourceActive } = systemApi;
