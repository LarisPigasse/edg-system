// src/features/vigilo/api/avvisi.ts — gli avvisi dell'utente, le sue preferenze e la sorgente della campanella e della pagina /avvisi (ADR090-ADR091, B8d-1)
import type { ModuleNotificationSource, NotificationFilter } from '../../../core/notifications';
import type { ElencoAvvisi, FiltriAvvisi, PreferenzeAvvisi, SchedaPreferenzeAvvisi, StatoElencoAvvisi } from '../types/avvisi';
import { notificaDi } from '../utils/avvisi';
import { leggi, richiesta } from './client';

/** I miei avvisi, dal più recente; senza filtri come nella campanella */
export const leggiAvvisi = (limit: number, f?: Partial<FiltriAvvisi> & { offset?: number }) => {
  const q = new URLSearchParams({ limit: String(limit) });
  if (f?.offset) q.set('offset', String(f.offset));
  if (f?.stato && f.stato !== 'tutti') q.set('stato', f.stato);
  if (f?.tipo) q.set('tipo', f.tipo);
  return leggi<ElencoAvvisi>(`/avvisi?${q}`);
};
export const segnaAvvisoLetto = (uuid: string) => richiesta<{ letto: boolean }>(`/avvisi/${uuid}/letto`, 'POST');
export const segnaAvvisiLetti = () => richiesta<{ letti: number }>('/avvisi/letti', 'POST');

export const leggiPreferenze = () => leggi<SchedaPreferenzeAvvisi>('/avvisi/preferenze');
export const salvaPreferenze = (p: PreferenzeAvvisi) => richiesta<SchedaPreferenzeAvvisi>('/avvisi/preferenze', 'PUT', p);
export const ripristinaPreferenze = () => richiesta<SchedaPreferenzeAvvisi>('/avvisi/preferenze', 'DELETE');

/** I filtri della piattaforma con le parole del servizio */
const STATO_DI: Record<NotificationFilter, StatoElencoAvvisi> = { all: 'tutti', unread: 'da-leggere', resolved: 'non-attuali' };

/**
 * La sorgente di Vigilo per la campanella e per la pagina /avvisi; `base` è il
 * percorso del modulo (es. '/vigilo'). Le preferenze (settings) le aggiunge il
 * manifest, che le carica solo quando servono.
 */
export const sorgenteAvvisi = (base: string): Omit<ModuleNotificationSource, 'settings'> => ({
  read: async limit => {
    const e = await leggiAvvisi(limit);
    return { unread: e.nonLetti, items: e.voci.map(v => notificaDi(v, base)) };
  },
  list: async ({ offset, limit, filter }) => {
    const e = await leggiAvvisi(limit, { offset, stato: STATO_DI[filter] });
    return { total: e.totale, unread: e.nonLetti, items: e.voci.map(v => notificaDi(v, base)) };
  },
  markRead: async id => {
    await segnaAvvisoLetto(id);
  },
  markAllRead: async () => {
    await segnaAvvisiLetti();
  },
});
