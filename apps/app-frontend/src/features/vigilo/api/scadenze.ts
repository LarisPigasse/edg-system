// src/features/vigilo/api/scadenze.ts
import type { DatiEsecuzione, DatiRinvio, DettaglioScadenza, EsitoEsecuzione, FiltriScadenze, Scadenza } from '../types/scadenze';
import { leggi, richiesta } from './client';

/** Solo i parametri valorizzati, codificati */
export const query = (parametri: Record<string, string | number | boolean | undefined>) => {
  const q = Object.entries(parametri)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `?${q}` : '';
};

export interface RichiestaScadenze extends FiltriScadenze {
  stati?: string;
  /** Le scadenze di un solo soggetto */
  soggetto?: string;
  controllo?: string;
  /** false = le chiuse (storiche); predefinito true */
  aperte?: boolean;
  verso?: 'asc' | 'desc';
  entro?: number;
  ordina?: 'urgenza' | 'soggetto' | 'scadeIl' | 'stato' | 'chiusaIl';
  pagina?: number;
  righe?: number;
}

export async function leggiScadenze(r: RichiestaScadenze) {
  const risposta = await richiesta<Scadenza[]>(`/scadenze${query({ ...r })}`);
  return { righe: risposta.data, totale: risposta.meta?.total ?? risposta.data.length, altre: !!risposta.meta?.hasNext };
}

/** Tutte le scadenze di una richiesta, a pagine da 128 (per il PDF), fino a `massimo` */
export async function leggiTutteScadenze(r: Omit<RichiestaScadenze, 'pagina' | 'righe'>, massimo = 1024) {
  const righe: Scadenza[] = [];
  for (let pagina = 1; righe.length < massimo; pagina++) {
    const l = await leggiScadenze({ ...r, pagina, righe: 128 });
    righe.push(...l.righe);
    if (!l.altre) return { righe, troncate: false };
  }
  return { righe, troncate: true };
}

// --- Una scadenza e le sue azioni -------------------------------------------

export const leggiScadenza = (uuid: string) => leggi<DettaglioScadenza>(`/scadenze/${uuid}`);

/** Fatto: chiude la scadenza (esito positivo) e apre la successiva */
export const registraEsecuzione = (uuid: string, dati: DatiEsecuzione) =>
  richiesta<EsitoEsecuzione>(`/scadenze/${uuid}/registrazioni`, 'POST', dati);

/** Sposta la data con un motivo, senza chiudere */
export const rinviaScadenza = (uuid: string, dati: DatiRinvio) => richiesta<unknown>(`/scadenze/${uuid}/rinvio`, 'POST', dati);

/** Data o soglia per le scadenze da completare */
export const completaScadenza = (uuid: string, dati: { scadeIl?: string | null; sogliaUso?: number | null }) =>
  richiesta<DettaglioScadenza>(`/scadenze/${uuid}`, 'PATCH', dati);

/** Nuova scadenza: di un controllo (con il soggetto) o un promemoria (con il titolo) */
export const creaScadenza = (dati: { soggetto: string | null; controllo: string | null; titolo?: string; scadeIl?: string; note?: string | null }) =>
  richiesta<DettaglioScadenza>('/scadenze', 'POST', dati);
