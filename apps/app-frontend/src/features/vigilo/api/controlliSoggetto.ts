// src/features/vigilo/api/controlliSoggetto.ts
//
// I controlli di un soggetto: quali si seguono, lo storico delle decisioni,
// non seguire (motivo obbligatorio) e tornare a seguire (nota facoltativa).
import type { ControlliSoggetto, DecisioneDelTenant, EsitoRipresa, QualiDecisioni } from '../types/controlliSoggetto';
import { leggi, richiesta } from './client';

export const leggiControlliSoggetto = (soggetto: string) => leggi<ControlliSoggetto>(`/soggetti/${soggetto}/controlli`);

/** Tutte le decisioni dell'azienda, per il report di Configurazione (fino a 1024, troncate oltre) */
export const leggiNonSeguiti = (quali: QualiDecisioni) =>
  leggi<{ righe: DecisioneDelTenant[]; troncate: boolean }>(`/controlli-non-seguiti?quali=${quali}`);

export const nonSeguireControllo = async (soggetto: string, controllo: string, motivo: string) =>
  (await richiesta<{ scadenzeChiuse: number }>(`/soggetti/${soggetto}/controlli/${controllo}/non-seguire`, 'POST', { motivo })).data;

export const riprendiControllo = async (soggetto: string, controllo: string, nota: string | null) =>
  (await richiesta<{ scadenza: EsitoRipresa }>(`/soggetti/${soggetto}/controlli/${controllo}/riprendi`, 'POST', { nota })).data;
