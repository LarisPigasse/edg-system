// src/features/vigilo/api/dashboard.ts
import type { Dashboard } from '../types/dashboard';
import type { FiltriScadenze } from '../types/scadenze';
import { leggi } from './client';
import { query } from './scadenze';

export const leggiDashboard = (f: FiltriScadenze) => leggi<Dashboard>(`/dashboard${query({ ...f })}`);
