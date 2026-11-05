// src/features/vigilo/api/rifornimenti.ts
//
// Rifornimenti e spese d'uso dei mezzi (tappa 2): elenco di un mezzo a pagine,
// nuovo, correzione ed eliminazione. Gli scontrini sono allegati con entità
// "rifornimento" (api/allegati.ts).
import type { DatiRifornimento, Rifornimento } from '../types/rifornimenti';
import { richiesta } from './client';
import { query } from './scadenze';

/** I rifornimenti di un mezzo, dal più recente */
export async function leggiRifornimenti(soggetto: string, pagina: number, righe: number) {
  const r = await richiesta<Rifornimento[]>(`/rifornimenti${query({ soggetto, pagina, righe })}`);
  return { righe: r.data, totale: r.meta?.total ?? r.data.length, altre: !!r.meta?.hasNext };
}

export const creaRifornimento = async (dati: DatiRifornimento) => (await richiesta<Rifornimento>('/rifornimenti', 'POST', dati)).data;

export const modificaRifornimento = async (uuid: string, dati: Partial<DatiRifornimento>) => (await richiesta<Rifornimento>(`/rifornimenti/${uuid}`, 'PATCH', dati)).data;

export const eliminaRifornimento = (uuid: string) => richiesta<null>(`/rifornimenti/${uuid}`, 'DELETE');
