// src/features/vigilo/api/calendario.ts
import type { Calendario } from '../types/calendario';
import type { FiltriScadenze } from '../types/scadenze';
import { leggi } from './client';
import { query } from './scadenze';

/** Le scadenze aperte fra `dal` e `al` (al massimo 64 giorni), con i filtri della dashboard */
export const leggiCalendario = (dal: string, al: string, f: FiltriScadenze) => leggi<Calendario>(`/calendario${query({ dal, al, ...f })}`);
