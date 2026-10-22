// src/features/vigilo/api/avvisi.ts — gli avvisi dell'utente e la sorgente della campanella (ADR090-ADR091)
import type { ModuleNotificationSource } from '../../../core/notifications';
import type { ElencoAvvisi } from '../types/avvisi';
import { notificaDi } from '../utils/avvisi';
import { leggi, richiesta } from './client';

export const leggiAvvisi = (limit: number) => leggi<ElencoAvvisi>(`/avvisi?limit=${limit}`);
export const segnaAvvisoLetto = (uuid: string) => richiesta<{ letto: boolean }>(`/avvisi/${uuid}/letto`, 'POST');
export const segnaAvvisiLetti = () => richiesta<{ letti: number }>('/avvisi/letti', 'POST');

/** La sorgente di Vigilo per la campanella; `base` è il percorso del modulo (es. '/vigilo') */
export const sorgenteAvvisi = (base: string): ModuleNotificationSource => ({
  read: async limit => {
    const e = await leggiAvvisi(limit);
    return { unread: e.nonLetti, items: e.voci.map(v => notificaDi(v, base)) };
  },
  markRead: async id => {
    await segnaAvvisoLetto(id);
  },
  markAllRead: async () => {
    await segnaAvvisiLetti();
  },
});
