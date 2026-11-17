// src/features/vigilo/api/resoconti.ts — Spese e consumi (B10c): solo con vigilo.read e vigilo.costi
import type { AndamentoCosti, AnteprimaPossesso, CostoMezzi, DatiPossesso, PeriodoAndamento } from '../types/costoMezzi';
import type { FiltriSpese, InterventiFornitori, RichiestaInterventiFornitori, Spese } from '../types/resoconti';
import { leggi } from './client';
import { fileConAccesso, salvaFile } from './file';
import { query } from './scadenze';

export const leggiSpese = (f: FiltriSpese) => leggi<Spese>(`/resoconti/spese${query({ ...f })}`);

/** Interventi e costi per fornitore nel periodo: tutti, un tipo o uno (report, 2026-11-12) */
export const leggiInterventiFornitori = (r: RichiestaInterventiFornitori) =>
  leggi<InterventiFornitori>(`/resoconti/fornitori${query({ ...r })}`);

/** Costo stimato dei mezzi (stessi filtri; con `soggetto` un solo mezzo) */
export const leggiCostoMezzi = (f: Partial<FiltriSpese> & { soggetto?: string }) => leggi<CostoMezzi>(`/resoconti/mezzi${query({ ...f })}`);

/** I costi di un mezzo mese per mese (andamento, 2026-11-16) */
export const leggiAndamentoMezzo = (mezzo: string, r: { periodo: PeriodoAndamento; dal?: string; al?: string }) =>
  leggi<AndamentoCosti>(`/resoconti/mezzi/${mezzo}/andamento${query({ ...r })}`);

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
