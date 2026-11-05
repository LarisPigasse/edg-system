// src/features/vigilo/api/resoconti.ts — Spese e consumi (B10c): solo con vigilo.read e vigilo.costi
import type { AnteprimaPossesso, CostoMezzi, DatiPossesso } from '../types/costoMezzi';
import type { FiltriSpese, Spese } from '../types/resoconti';
import { leggi } from './client';
import { fileConAccesso, salvaFile } from './file';
import { query } from './scadenze';

export const leggiSpese = (f: FiltriSpese) => leggi<Spese>(`/resoconti/spese${query({ ...f })}`);

/** Costo stimato dei mezzi (stessi filtri; con `soggetto` un solo mezzo) */
export const leggiCostoMezzi = (f: Partial<FiltriSpese> & { soggetto?: string }) => leggi<CostoMezzi>(`/resoconti/mezzi${query({ ...f })}`);

/** Quota mensile, errori e avviso mentre si scrive il costo di possesso */
export const anteprimaPossesso = (d: Partial<DatiPossesso>, categoria?: string, escludi?: string) =>
  leggi<AnteprimaPossesso>(`/resoconti/possesso/anteprima${query({ ...d, dal: d.dal ?? undefined, categoria, escludi })}`);

/** Il CSV delle spese del periodo (stessi filtri): lo si fa scaricare col nome dato dal servizio */
export async function scaricaCsvSpese(f: FiltriSpese): Promise<void> {
  const { blob, nome } = await fileConAccesso(`/api/vigilo/resoconti/spese/righe.csv${query({ ...f })}`);
  const url = URL.createObjectURL(blob);
  salvaFile(url, nome ?? 'spese-vigilo.csv');
  // il tempo di partire al download, poi si libera la memoria
  setTimeout(() => URL.revokeObjectURL(url), 4096);
}
