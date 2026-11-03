// src/features/vigilo/api/fornitori.ts
//
// La rubrica dei fornitori (F1): elenco con filtri, tipi dal catalogo comune
// (F0), nuovo, modifica, attiva/disattiva, elimina (solo se nessuna
// registrazione lo cita) e le registrazioni che lo citano.
import type { DatiFornitore, FiltriFornitori, Fornitore, OrdinaFornitori, RegistrazioneFornitore, TipoFornitore } from '../types/fornitori';
import { leggiTutti, richiesta } from './client';
import { query } from './scadenze';

/** I fornitori attivi, per sceglierli nel modulo Registra */
export const leggiFornitori = () => leggiTutti<Fornitore>('/fornitori');

/** I tipi del catalogo comune: al cliente solo gli attivi */
export const leggiTipiFornitore = () => leggiTutti<TipoFornitore>('/fornitori/tipi');

export interface RichiestaFornitori extends FiltriFornitori {
  testo?: string;
  ordina: OrdinaFornitori;
  pagina: number;
  righe: number;
}

export async function leggiElencoFornitori(r: RichiestaFornitori) {
  const risposta = await richiesta<Fornitore[]>(`/fornitori${query({ ...r })}`);
  return { righe: risposta.data, totale: risposta.meta?.total ?? risposta.data.length, altre: !!risposta.meta?.hasNext };
}

export const creaFornitore = (dati: DatiFornitore) => richiesta<Fornitore>('/fornitori', 'POST', dati);

export const modificaFornitore = (uuid: string, dati: Partial<DatiFornitore> & { attivo?: boolean }) =>
  richiesta<Fornitore>(`/fornitori/${uuid}`, 'PATCH', dati);

export const eliminaFornitore = (uuid: string) => richiesta<null>(`/fornitori/${uuid}`, 'DELETE');

/** Le registrazioni che citano il fornitore, le più recenti per prime */
export async function leggiRegistrazioniFornitore(fornitore: string, pagina: number, righe: number) {
  const r = await richiesta<RegistrazioneFornitore[]>(`/registrazioni${query({ fornitore, pagina, righe })}`);
  return { righe: r.data, totale: r.meta?.total ?? r.data.length, altre: !!r.meta?.hasNext };
}
