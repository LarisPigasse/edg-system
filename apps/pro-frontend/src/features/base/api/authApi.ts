// src/features/base/api/authApi.ts

/**
 * Client verso le risorse esposte da auth-service tramite il gateway su
 * /auth/<risorsa> — usato in questa feature solo per popolare il selettore
 * tenant nel form anagrafiche (ogni cliente/partner ha un proprio tenant
 * dedicato, eventualmente condiviso tra più anagrafiche dello stesso gruppo
 * aziendale). Istanza propria della fabbrica generica (shared/api), scoped a
 * questo basePath: stesso pattern di features/sistema/api/authApi.ts per lo
 * stesso backend visto dal lato gestione account/tenant del prodotto — le
 * due feature restano indipendenti, ognuna con la propria istanza.
 */
import { createResourceApi } from '../../../shared/api/createResourceApi';

export const authApi = createResourceApi('/auth');
