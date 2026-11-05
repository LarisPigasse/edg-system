// src/features/vigilo/hooks/useSpese.ts
//
// Lo stato della vista Spese e consumi (B10c): periodo (con le date se
// personalizzato), tipo di soggetto, sede e la ricerca della barra della
// Dashboard. Rilegge a ogni cambio; con un periodo personalizzato incompleto
// o sbagliato non chiede nulla e dice perché. Solo l'ultima richiesta conta.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { leggiSpese } from '../api/resoconti';
import { GIORNI_MASSIMI_SPESE } from '../constants/resoconti';
import type { FiltriSpese, Spese } from '../types/resoconti';
import { daGiorno } from '../utils/giorni';
import { useRitardato } from './useRitardato';

/** Che cosa non va nel periodo personalizzato, o null */
function erroreDate(f: FiltriSpese): string | null {
  if (f.periodo !== 'personalizzato') return null;
  if (!f.dal || !f.al) return 'Scegli le date di inizio e di fine.';
  if (f.al < f.dal) return 'La data di fine viene prima di quella di inizio.';
  if ((daGiorno(f.al).getTime() - daGiorno(f.dal).getTime()) / 864e5 + 1 > GIORNI_MASSIMI_SPESE) return 'Il periodo può essere al massimo di 4 anni.';
  return null;
}

export function useSpese(testo: string) {
  const [filtri, setFiltri] = useState<FiltriSpese>({ periodo: 'anno' });
  const [dati, setDati] = useState<Spese | null>(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const testoRitardato = useRitardato(testo.trim());
  const turno = useRef(0);

  const richiesta = useMemo<FiltriSpese>(() => {
    const { dal, al, ...resto } = filtri;
    return { ...resto, ...(filtri.periodo === 'personalizzato' ? { dal, al } : {}), testo: testoRitardato || undefined };
  }, [filtri, testoRitardato]);
  const avvisoDate = erroreDate(filtri);

  const carica = useCallback(async () => {
    if (avvisoDate) return;
    const mio = ++turno.current;
    setCaricamento(true);
    try {
      const d = await leggiSpese(richiesta);
      if (mio !== turno.current) return;
      setDati(d);
      setErrore(null);
    } catch (e) {
      if (mio === turno.current) setErrore((e as Error).message);
    } finally {
      if (mio === turno.current) setCaricamento(false);
    }
  }, [richiesta, avvisoDate]);

  useEffect(() => {
    void carica();
  }, [carica]);

  // richiesta: i filtri come li vede il servizio (anche per il CSV)
  return { filtri, setFiltri, richiesta, dati, caricamento, errore, avvisoDate, ricarica: carica };
}

export type StatoSpese = ReturnType<typeof useSpese>;
