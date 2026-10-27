// src/features/vigilo/hooks/useMieiAvvisi.ts
//
// L'elenco completo dei miei avvisi (B8d-1): filtri per stato e tipo di
// soggetto, pagine da 32 ("Mostra altri"), "letto" mostrato subito e
// confermato al servizio (se rifiuta, si rilegge). Solo l'ultima lettura
// conta: cambiando in fretta i filtri non si mescolano risposte vecchie.
import { useCallback, useEffect, useRef, useState } from 'react';

import { useNotificationSources } from '../../../core/notifications';
import { leggiAvvisi, segnaAvvisiLetti, segnaAvvisoLetto } from '../api/avvisi';
import { AVVISI_PER_PAGINA } from '../constants/avvisi';
import type { FiltriAvvisi, VoceAvviso } from '../types/avvisi';

export function useMieiAvvisi() {
  const [filtri, setFiltri] = useState<FiltriAvvisi>({ stato: 'tutti' });
  const [voci, setVoci] = useState<VoceAvviso[]>([]);
  const [totale, setTotale] = useState(0);
  const [nonLetti, setNonLetti] = useState(0);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const turno = useRef(0);
  // dopo un "letto" la campanella si aggiorna subito (B8d-1 bis)
  const { refresh } = useNotificationSources();

  const carica = useCallback(
    async (offset: number) => {
      const mio = ++turno.current;
      setCaricamento(true);
      try {
        const e = await leggiAvvisi(AVVISI_PER_PAGINA, { ...filtri, offset });
        if (mio !== turno.current) return;
        setVoci(v => (offset ? [...v, ...e.voci] : e.voci));
        setTotale(e.totale);
        setNonLetti(e.nonLetti);
        setErrore(null);
      } catch (err) {
        if (mio === turno.current) setErrore((err as Error).message);
      } finally {
        if (mio === turno.current) setCaricamento(false);
      }
    },
    [filtri]
  );

  useEffect(() => {
    void carica(0);
  }, [carica]);

  /** Un avviso aperto: da leggere → letto */
  const segnaLetto = useCallback(
    (v: VoceAvviso) => {
      if (v.consegna !== 'inviato') return;
      setVoci(l => l.map(x => (x.uuid === v.uuid ? { ...x, consegna: 'letto' } : x)));
      setNonLetti(n => Math.max(0, n - 1));
      segnaAvvisoLetto(v.uuid)
        .then(refresh)
        .catch(() => void carica(0));
    },
    [carica, refresh]
  );

  const segnaTutti = useCallback(async () => {
    setVoci(l => l.map(x => (x.consegna === 'inviato' ? { ...x, consegna: 'letto' } : x)));
    setNonLetti(0);
    try {
      await segnaAvvisiLetti();
    } finally {
      refresh();
      void carica(0);
    }
  }, [carica, refresh]);

  return {
    filtri,
    setFiltri,
    voci,
    totale,
    nonLetti,
    caricamento,
    errore,
    altri: voci.length < totale,
    mostraAltri: () => carica(voci.length),
    ricarica: () => carica(0),
    segnaLetto,
    segnaTutti,
  };
}

export type StatoMieiAvvisi = ReturnType<typeof useMieiAvvisi>;
