// src/features/vigilo/api/dashboard.ts
import type { Dashboard } from '../types/dashboard';
import type { FiltriScadenze } from '../types/scadenze';
import { leggi } from './client';
import { query } from './scadenze';

/** `intestazioni`: INTESTAZIONE_SFONDO quando la legge un'altra pagina (es. i conteggi di Soggetti, ADR117) */
export const leggiDashboard = (f: FiltriScadenze, intestazioni?: Readonly<Record<string, string>>) =>
  leggi<Dashboard>(`/dashboard${query({ ...f })}`, intestazioni);
