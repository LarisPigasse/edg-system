// src/features/vigilo/api/avvio.ts — procedura di avvio (ADR076)
import type { EsitoAvvio, Proposta, SceltaAvvio, StatoAvvio } from '../types/avvio';
import { leggi, richiesta } from './client';

export const leggiStatoAvvio = () => leggi<StatoAvvio>('/avvio');

export const leggiProposta = (modelli: string[]) =>
  leggi<Proposta>(`/avvio/proposta?modelli=${encodeURIComponent(modelli.join(','))}`);

export const avvia = (scelta: SceltaAvvio) => richiesta<EsitoAvvio>('/avvio', 'POST', scelta);
