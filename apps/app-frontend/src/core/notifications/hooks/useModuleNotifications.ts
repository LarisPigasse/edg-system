// src/core/notifications/hooks/useModuleNotifications.ts
//
// Unisce le sorgenti degli avvisi dei moduli (ADR091) in ciò che la
// campanella di @edg/ui si aspetta: le voci più recenti di tutti i moduli,
// i da leggere in tutto e le azioni. Rilegge ogni VITE_AVVISI_RILETTURA_S
// secondi (predefinito 64, da 16 a 256) se la scheda è in vista, quando si
// torna sulla scheda e quando si apre il pannello. "Letto"
// si mostra subito e si conferma al servizio; se il servizio rifiuta, si
// rilegge. Un modulo che non risponde non spegne gli altri.
// In fondo al pannello "Tutti gli avvisi" porta alla pagina della
// piattaforma (/avvisi): la campanella è di tutti i moduli (B8d-1 bis).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EdgNotification, EdgNotifications } from '@edg/ui';

import { NOTIFICATIONS_PATH } from '../constants';
import type { ActiveNotificationSource } from '../types';

const FOOTER = { label: 'Tutti gli avvisi', href: NOTIFICATIONS_PATH };

/** Voci mostrate nel pannello (per tutti i moduli insieme) */
const LIMITE = 32;

/** Il parametro di rilettura dentro i suoi limiti (ADR093): un valore sbagliato non rompe nulla */
const RILETTURA = { predefinito: 64, min: 16, max: 256 } as const;
const secondi = Number(import.meta.env.VITE_AVVISI_RILETTURA_S);
const OGNI_MS = (Number.isFinite(secondi) && secondi > 0 ? Math.min(RILETTURA.max, Math.max(RILETTURA.min, Math.round(secondi))) : RILETTURA.predefinito) * 1000;

interface Stato {
  items: EdgNotification[];
  unread: number;
  loading: boolean;
  error: string | null;
}

const VUOTO: Stato = { items: [], unread: 0, loading: false, error: null };

/** Stesso contenuto: si tiene lo stato di prima, così l'app non si ridisegna a ogni lettura */
const uguale = (a: Stato, b: Stato) => a.unread === b.unread && a.loading === b.loading && a.error === b.error && JSON.stringify(a.items) === JSON.stringify(b.items);

/** 'vigilo:<uuid>' → la sorgente e l'id nel modulo */
const separa = (id: string) => {
  const i = id.indexOf(':');
  return { key: id.slice(0, i), id: id.slice(i + 1) };
};

export function useModuleNotifications(sorgenti: ActiveNotificationSource[]): EdgNotifications | null {
  const [stato, setStato] = useState<Stato>(VUOTO);
  const rif = useRef(sorgenti);
  rif.current = sorgenti;
  /** Solo l'ultima lettura conta */
  const turno = useRef(0);
  const chiave = sorgenti.map(s => s.key).join(',');

  const leggi = useCallback(async () => {
    const mio = ++turno.current;
    const lista = rif.current;
    if (!lista.length) {
      setStato(s => (uguale(s, VUOTO) ? s : VUOTO));
      return;
    }
    // "in caricamento" solo per la prima lettura: dopo restano le voci di prima
    setStato(s => (s.loading || s.items.length ? s : { ...s, loading: true }));
    const esiti = await Promise.allSettled(lista.map(s => s.source.read(LIMITE)));
    if (mio !== turno.current) return;
    let unread = 0;
    let falliti = 0;
    const items: EdgNotification[] = [];
    esiti.forEach((e, i) => {
      const s = lista[i];
      if (e.status === 'rejected') {
        falliti++;
        return;
      }
      unread += e.value.unread;
      for (const n of e.value.items) items.push({ ...n, id: `${s.key}:${n.id}`, source: s.name });
    });
    items.sort((a, b) => b.date.localeCompare(a.date));
    const nuovo: Stato = {
      items: items.slice(0, LIMITE),
      unread,
      loading: false,
      error: falliti === lista.length ? 'Impossibile leggere gli avvisi, riprova tra poco.' : null,
    };
    setStato(s => (uguale(s, nuovo) ? s : nuovo));
  }, []);

  useEffect(() => {
    void leggi();
    if (!chiave) return;
    const inVista = () => document.visibilityState === 'visible';
    const timer = window.setInterval(() => inVista() && void leggi(), OGNI_MS);
    const alRitorno = () => inVista() && void leggi();
    document.addEventListener('visibilitychange', alRitorno);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', alRitorno);
    };
  }, [chiave, leggi]);

  const onSelect = useCallback(
    (n: EdgNotification) => {
      if (!n.unread) return;
      setStato(s => ({ ...s, unread: Math.max(0, s.unread - 1), items: s.items.map(x => (x.id === n.id ? { ...x, unread: false } : x)) }));
      const { key, id } = separa(n.id);
      const s = rif.current.find(x => x.key === key);
      s?.source.markRead(id).catch(() => void leggi());
    },
    [leggi]
  );

  const onReadAll = useCallback(() => {
    setStato(s => ({ ...s, unread: 0, items: s.items.map(x => ({ ...x, unread: false })) }));
    void Promise.allSettled(rif.current.map(s => s.source.markAllRead())).then(() => leggi());
  }, [leggi]);

  return useMemo(
    () => (chiave ? { ...stato, onOpen: () => void leggi(), onSelect, onReadAll, footer: FOOTER } : null),
    [chiave, stato, leggi, onSelect, onReadAll]
  );
}
