// src/features/vigilo/api/stima.ts
//
// Stima dei costi di un servizio (2026-11-17): parametri generali e costi
// aziendali per anno. Ogni modifica risponde con i parametri aggiornati.
import type { CalcoloStima, DatiAnno, ParametriStima, RegoleStima, RichiestaCalcolo, StimaRiga, StimaSalvata } from '../types/stima';
import { leggi, leggiTutti, richiesta } from './client';

export const leggiParametriStima = () => leggi<ParametriStima>('/stima/parametri');

export const cambiaParametriStima = async (modifica: Partial<RegoleStima>) =>
  (await richiesta<ParametriStima>('/stima/parametri', 'PATCH', modifica)).data;

export const salvaCostiAnno = async (anno: number, dati: DatiAnno) => (await richiesta<ParametriStima>(`/stima/anni/${anno}`, 'PUT', dati)).data;

/** La stima di un servizio: ciò che ha usato e il risultato */
export const calcolaStima = async (r: RichiestaCalcolo) => (await richiesta<CalcoloStima>('/stima/calcola', 'POST', r)).data;

// --- Stime salvate (fase 3) ---

/** Le stime salvate, le più recenti per prime */
export const leggiStime = () => leggiTutti<StimaRiga>('/stima/stime');

export const salvaStima = async (r: RichiestaCalcolo & { descrizione: string }) => (await richiesta<StimaSalvata>('/stima/stime', 'POST', r)).data;

export const leggiStima = (uuid: string) => leggi<StimaSalvata>(`/stima/stime/${uuid}`);

/** Il costo reale dopo il servizio; null lo toglie */
export const registraCostoReale = async (uuid: string, costoReale: number | null, note: string | null) =>
  (await richiesta<StimaSalvata>(`/stima/stime/${uuid}/reale`, 'PATCH', { costoReale, note })).data;

export const eliminaStima = (uuid: string) => richiesta<null>(`/stima/stime/${uuid}`, 'DELETE');

export const eliminaCostiAnno = async (anno: number) => (await richiesta<ParametriStima>(`/stima/anni/${anno}`, 'DELETE')).data;
