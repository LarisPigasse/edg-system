// src/core/notifications/hooks/usePlatformNotifications.ts
//
// Tutti gli avvisi dell'utente, di tutti i moduli che li sfogliano (list),
// dal più recente, a pagine da 32: filtro (tutti, da leggere, non più
// attuali) e modulo. Solo l'ultima lettura conta. Un modulo che non
// risponde non spegne gli altri: lo si dice per nome. "Letto" si mostra
// subito, si conferma al modulo e si rilegge la campanella.
import { useCallback, useEffect, useRef, useState } from 'react';

import { NOTIFICATIONS_PAGE_SIZE } from '../constants';
import type { NotificationFilter, PlatformNotification } from '../types';
import { daRiempire, nuovoCursore, prendiPiuRecenti, type Cursore } from '../utils/unione';
import { useNotificationSources } from './useNotificationSources';

export function usePlatformNotifications() {
  const { sources, refresh } = useNotificationSources();
  const sfogliabili = sources.filter(s => s.source.list);
  const chiave = sfogliabili.map(s => s.key).join(',');
  const rif = useRef(sfogliabili);
  rif.current = sfogliabili;

  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [module, setModule] = useState<string | undefined>();
  const [items, setItems] = useState<PlatformNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cursori = useRef<Cursore[]>([]);
  const turno = useRef(0);

  const carica = useCallback(
    async (daCapo: boolean) => {
      if (daCapo) cursori.current = rif.current.filter(s => !module || s.key === module).map(nuovoCursore);
      const mio = daCapo ? ++turno.current : turno.current;
      setLoading(true);
      const da = daRiempire(cursori.current, NOTIFICATIONS_PAGE_SIZE);
      const esiti = await Promise.allSettled(
        da.map(c => c.sorgente.source.list!({ offset: c.letti, limit: NOTIFICATIONS_PAGE_SIZE, filter }))
      );
      if (mio !== turno.current) return;
      const muti: string[] = [];
      esiti.forEach((e, i) => {
        const c = da[i];
        if (e.status === 'rejected') {
          c.finito = true;
          muti.push(c.sorgente.name);
          return;
        }
        const r = e.value;
        c.deposito.push(...r.items.map(n => ({ ...n, key: `${c.sorgente.key}:${n.id}`, module: c.sorgente.key, source: c.sorgente.name })));
        c.letti += r.items.length;
        c.totale = r.total;
        c.daLeggere = r.unread;
        c.finito = !r.items.length || c.letti >= r.total;
      });
      const nuove = prendiPiuRecenti(cursori.current, NOTIFICATIONS_PAGE_SIZE);
      setItems(prima => (daCapo ? nuove : [...prima, ...nuove]));
      setTotal(cursori.current.reduce((s, c) => s + c.totale, 0));
      setUnread(cursori.current.reduce((s, c) => s + c.daLeggere, 0));
      setError(muti.length ? `Gli avvisi di ${muti.join(', ')} non sono disponibili in questo momento.` : null);
      setLoading(false);
    },
    [filter, module]
  );

  // le sorgenti stanno in rif: si rilegge anche quando cambia la loro chiave
  useEffect(() => {
    void carica(true);
  }, [carica, chiave]);

  /** Un avviso aperto: da leggere → letto, nel modulo e nella campanella */
  const markRead = useCallback(
    (n: PlatformNotification) => {
      if (!n.unread) return;
      setItems(l => l.map(x => (x.key === n.key ? { ...x, unread: false } : x)));
      setUnread(u => Math.max(0, u - 1));
      const s = rif.current.find(x => x.key === n.module);
      s?.source
        .markRead(n.id)
        .then(refresh)
        .catch(() => void carica(true));
    },
    [carica, refresh]
  );

  /** Tutti letti, nei moduli scelti */
  const markAllRead = useCallback(async () => {
    setItems(l => l.map(x => ({ ...x, unread: false })));
    setUnread(0);
    await Promise.allSettled(rif.current.filter(s => !module || s.key === module).map(s => s.source.markAllRead()));
    refresh();
    void carica(true);
  }, [carica, module, refresh]);

  return {
    modules: sfogliabili.map(s => ({ key: s.key, name: s.name })),
    filter,
    setFilter,
    module,
    setModule,
    items,
    total,
    unread,
    loading,
    error,
    more: items.length < total,
    showMore: () => carica(false),
    reload: () => carica(true),
    markRead,
    markAllRead,
  };
}

export type PlatformNotificationsState = ReturnType<typeof usePlatformNotifications>;
