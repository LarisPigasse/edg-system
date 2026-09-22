// src/features/sistema/api/systemApi.ts

/**
 * Client verso le risorse esposte da system-service tramite il gateway su
 * /api/system/<risorsa> — usato in questa feature solo per popolare il
 * selettore di collegamento account→entità (EntityLinkSelect). Istanza
 * propria della fabbrica generica (shared/api), scoped a questo basePath:
 * stesso pattern di authApi.ts in questo stesso folder, e di
 * features/base/api/systemApi.ts per lo stesso backend visto dal lato
 * anagrafica/operatori del prodotto — le due feature restano indipendenti,
 * ognuna con la propria istanza.
 */
import { createResourceApi } from '../../../shared/api/createResourceApi';

export const systemApi = createResourceApi('/api/system');
