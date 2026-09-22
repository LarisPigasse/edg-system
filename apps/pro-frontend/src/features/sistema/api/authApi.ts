// src/features/sistema/api/authApi.ts

/**
 * Client verso le risorse esposte da auth-service tramite il gateway su
 * /auth/<risorsa> (Tenant, e in seguito Account e Ruoli — ADR024). Istanzia
 * la fabbrica generica (shared/api) con il basePath di questo backend — vedi
 * features/base/api/systemApi.ts per l'equivalente su system-service.
 */
import { createResourceApi } from '../../../shared/api/createResourceApi';

export const authApi = createResourceApi('/auth');
