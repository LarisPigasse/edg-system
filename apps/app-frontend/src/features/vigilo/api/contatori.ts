// src/features/vigilo/api/contatori.ts
import type { Lettura } from '../types/soggetti';
import { leggi, richiesta } from './client';

/** Una lettura del contatore (km, ore): aggiorna le stime delle scadenze a uso */
export const registraLettura = (uuidContatore: string, dati: { valore: number; lettoIl?: string; note?: string | null }) =>
  richiesta<unknown>(`/contatori/${uuidContatore}/letture`, 'POST', dati);

/** Corregge una lettura sbagliata eliminandola (non quelle delle registrazioni) */
export const eliminaLettura = (uuidLettura: string) => richiesta<unknown>(`/letture/${uuidLettura}`, 'DELETE');

/** Le ultime letture, le più recenti per prime */
export const leggiLetture = (uuidContatore: string, righe: number) =>
  leggi<Lettura[]>(`/contatori/${uuidContatore}/letture?righe=${righe}&verso=desc`);
