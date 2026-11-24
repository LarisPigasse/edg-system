// src/features/vigilo/api/analisi.ts — gli indicatori dell'azienda (2026-11-23)
import type { Analisi, SoglieAnalisi } from '../types/analisi';
import { richiesta } from './client';

export const leggiAnalisi = async () => (await richiesta<Analisi>('/analisi')).data;

/** Cambia le soglie dei segnali (vigilo.config): risponde con l'analisi ricalcolata */
export const cambiaSoglie = async (soglie: Partial<SoglieAnalisi>) => (await richiesta<Analisi>('/analisi/soglie', 'PATCH', soglie)).data;
