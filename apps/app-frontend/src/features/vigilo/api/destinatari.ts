// src/features/vigilo/api/destinatari.ts — chi riceve gli avvisi di controlli e scadenze (B8d-3)
import type { AnteprimaDestinatari, Destinatario } from '../types/destinatari';
import { leggi, richiesta } from './client';

export const leggiAnteprimaDestinatari = (scadenza: string) => leggi<AnteprimaDestinatari>(`/scadenze/${scadenza}/destinatari`);

/** null = come il controllo */
export const cambiaDestinatariScadenza = (scadenza: string, destinatari: Destinatario[] | null) =>
  richiesta<unknown>(`/scadenze/${scadenza}`, 'PATCH', { destinatari });

export const cambiaDestinatariControllo = (controllo: string, destinatari: Destinatario[]) =>
  richiesta<unknown>(`/controlli/${controllo}`, 'PATCH', { destinatari });
