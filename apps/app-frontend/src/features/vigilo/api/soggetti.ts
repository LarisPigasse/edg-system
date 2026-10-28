// src/features/vigilo/api/soggetti.ts
import type { RiferimentoSoggetto } from '../types/scadenze';
import type { AccountCollegabile, Assegnazione, DatiSoggetto, EsitoSalvataggio, EsitoStato, FiltriSoggetti, OrdinaSoggetti, RegistrazioneStorico, Soggetto, StatoSoggetto } from '../types/soggetti';
import type { TipoSoggetto } from '../types/valori';
import { leggi, leggiTutti, richiesta } from './client';
import { query } from './scadenze';

/** Le sedi, per i filtri */
export const leggiSedi = () => leggiTutti<RiferimentoSoggetto>('/soggetti?tipo=sede&ordina=nome');

export interface RichiestaSoggetti extends FiltriSoggetti {
  tipo?: TipoSoggetto;
  testo?: string;
  ordina: OrdinaSoggetti;
  pagina: number;
  righe: number;
}

export async function leggiSoggetti(r: RichiestaSoggetti) {
  const risposta = await richiesta<Soggetto[]>(`/soggetti${query({ ...r })}`);
  return { righe: risposta.data, totale: risposta.meta?.total ?? risposta.data.length, altre: !!risposta.meta?.hasNext };
}

// --- Un soggetto ------------------------------------------------------------

export const leggiSoggetto = (uuid: string) => leggi<Soggetto>(`/soggetti/${uuid}`);

/** Gli account del cliente da collegare a una persona (B9b) */
export const leggiAccount = () => leggi<AccountCollegabile[]>('/account');

/** Collega (o scollega con null) un account a una persona */
export const collegaAccount = (persona: string, account: number | null) => richiesta<Soggetto>(`/soggetti/${persona}/account`, 'PUT', { account });

/** Attivo, sospeso, archiviato (codici in-servizio, fermo, dismesso) */
export const cambiaStatoSoggetto = (uuid: string, stato: StatoSoggetto) =>
  richiesta<Soggetto & EsitoStato>(`/soggetti/${uuid}/stato`, 'POST', { stato });

/** Lo storico: le registrazioni di tutte le sue scadenze, le più recenti per prime */
export async function leggiStorico(soggetto: string, pagina: number, righe: number) {
  const r = await richiesta<RegistrazioneStorico[]>(`/registrazioni${query({ soggetto, pagina, righe })}`);
  return { righe: r.data, totale: r.meta?.total ?? r.data.length, altre: !!r.meta?.hasNext };
}

/** Chi usa un mezzo (soggetto) o quali mezzi usa una persona (persona) */
export const leggiAssegnazioni = (filtro: { soggetto: string } | { persona: string }) =>
  leggiTutti<Assegnazione>(`/assegnazioni${query({ ...filtro, ordina: 'dal', verso: 'desc' })}`);

/** Le persone, per scegliere il referente */
export const leggiPersone = () => leggiTutti<RiferimentoSoggetto>('/soggetti?tipo=persona&ordina=nome');

/** Nuovo soggetto: il servizio crea anche contatori e scadenze dei controlli automatici */
export const creaSoggetto = (dati: DatiSoggetto) => richiesta<Soggetto & EsitoSalvataggio>('/soggetti', 'POST', dati);

/** Modifica (senza il tipo, che non cambia) */
export const modificaSoggetto = (uuid: string, dati: Omit<DatiSoggetto, 'tipo'>) =>
  richiesta<Soggetto & EsitoSalvataggio>(`/soggetti/${uuid}`, 'PATCH', dati);
