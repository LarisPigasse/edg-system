// src/features/vigilo/hooks/useDashboard.ts
//
// Lo stato della vista "Da fare": ricerca e filtri, riquadro scelto,
// ordinamento, i dati della dashboard e l'elenco a pagine (32 righe,
// "Mostra altre"). Dati ed elenco seguono gli stessi filtri, così i numeri
// corrispondono a ciò che si vede.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { leggiDashboard } from '../api/dashboard';
import { leggiScadenze } from '../api/scadenze';
import { useRitardato } from './useRitardato';
import type { Dashboard } from '../types/dashboard';
import type { FiltriScadenze, Scadenza } from '../types/scadenze';
import { DEFINIZIONI, type Vista } from '../constants/viste';

export type Ordina = 'urgenza' | 'soggetto';
const RIGHE = 32;

export function useDashboard() {
  const [testo, setTesto] = useState('');
  const [filtri, setFiltri] = useState<Omit<FiltriScadenze, 'testo'>>({});
  const [vista, setVista] = useState<Vista>('da-fare');
  const [ordina, setOrdina] = useState<Ordina>('urgenza');

  const [dati, setDati] = useState<Dashboard | null>(null);
  const [righe, setRighe] = useState<Scadenza[]>([]);
  const [totale, setTotale] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [altre, setAltre] = useState(false);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  const testoRitardato = useRitardato(testo.trim());
  const completi = useMemo<FiltriScadenze>(() => ({ ...filtri, testo: testoRitardato || undefined }), [filtri, testoRitardato]);
  /** Solo l'ultima richiesta conta: risposte lente di filtri vecchi si scartano */
  const turno = useRef(0);

  const richiesta = useCallback(
    (p: number) => ({ ...completi, ...DEFINIZIONI[vista].richiesta, ordina, pagina: p, righe: RIGHE }),
    [completi, vista, ordina]
  );

  const carica = useCallback(async () => {
    const mio = ++turno.current;
    setCaricamento(true);
    try {
      const d = await leggiDashboard(completi);
      const l = await leggiScadenze(richiesta(1));
      if (mio !== turno.current) return;
      setDati(d);
      setRighe(l.righe);
      setTotale(l.totale);
      setAltre(l.altre);
      setPagina(1);
      setErrore(null);
    } catch (e) {
      if (mio === turno.current) setErrore((e as Error).message);
    } finally {
      if (mio === turno.current) setCaricamento(false);
    }
  }, [completi, richiesta]);

  useEffect(() => {
    void carica();
  }, [carica]);

  const mostraAltre = useCallback(async () => {
    const mio = turno.current;
    setCaricamento(true);
    try {
      const l = await leggiScadenze(richiesta(pagina + 1));
      if (mio !== turno.current) return;
      setRighe(prima => [...prima, ...l.righe]);
      setAltre(l.altre);
      setPagina(p => p + 1);
    } catch (e) {
      setErrore((e as Error).message);
    } finally {
      setCaricamento(false);
    }
  }, [richiesta, pagina]);

  /** Clic su un riquadro: lo sceglie; un secondo clic torna a "Da fare" */
  const scegliVista = useCallback((v: Vista) => setVista(attuale => (attuale === v ? 'da-fare' : v)), []);

  const filtriAttivi = !!(testo.trim() || filtri.tipo || filtri.natura || filtri.sede);
  const azzeraFiltri = useCallback(() => {
    setTesto('');
    setFiltri({});
  }, []);

  return {
    testo,
    setTesto,
    filtri,
    setFiltri,
    filtriAttivi,
    azzeraFiltri,
    vista,
    scegliVista,
    ordina,
    setOrdina,
    dati,
    righe,
    totale,
    altre,
    mostraAltre,
    caricamento,
    errore,
    ricarica: carica,
  };
}

export type StatoDashboard = ReturnType<typeof useDashboard>;
