// src/features/vigilo/api/client.ts
//
// Unico punto di contatto con vigilo-service (via gateway, /api/vigilo):
// token e rinnovo li gestisce apiFetch, qui si scioglie l'inviluppo
// { success, data, message }. Gli errori arrivano già in italiano dal servizio.
import { apiFetch } from '@edg/auth';

const BASE = '/api/vigilo';

export interface Risposta<T> {
  success: boolean;
  data: T;
  message?: string;
  /** Solo nelle liste */
  meta?: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean };
}

export function richiesta<T>(percorso: string, metodo = 'GET', corpo?: unknown): Promise<Risposta<T>> {
  return apiFetch<Risposta<T>>(`${BASE}${percorso}`, {
    method: metodo,
    ...(corpo !== undefined ? { body: JSON.stringify(corpo) } : {}),
  });
}

/** Solo i dati della risposta */
export const leggi = async <T>(percorso: string): Promise<T> => (await richiesta<T>(percorso)).data;

const RIGHE = 128;
const PAGINE_MASSIME = 16;

/**
 * Tutte le righe di una lista, a pagine da 128: per gli elenchi che restano
 * piccoli per natura (categorie e controlli di un cliente), non per le
 * scadenze, che si sfogliano.
 */
export async function leggiTutti<T>(percorso: string): Promise<T[]> {
  const sep = percorso.includes('?') ? '&' : '?';
  const righe: T[] = [];
  for (let pagina = 1; pagina <= PAGINE_MASSIME; pagina++) {
    const r = await richiesta<T[]>(`${percorso}${sep}righe=${RIGHE}&pagina=${pagina}`);
    righe.push(...r.data);
    if (!r.meta?.hasNext) break;
  }
  return righe;
}
