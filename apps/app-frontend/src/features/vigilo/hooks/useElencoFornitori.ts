// src/features/vigilo/hooks/useElencoFornitori.ts
//
// Lo stato dell'elenco dei fornitori (F1): ricerca, stato (attivi,
// disattivati, tutti), tipo, ordinamento e pagine da 32 ("Mostra altri").
// Solo l'ultima richiesta conta.
import { useCallback, useEffect, useRef, useState } from 'react';

import { leggiElencoFornitori } from '../api/fornitori';
import { RIGHE_FORNITORI } from '../constants/fornitori';
import type { FiltriFornitori, Fornitore, OrdinaFornitori } from '../types/fornitori';
import { useRitardato } from './useRitardato';

const FILTRI_INIZIALI: FiltriFornitori = { stato: 'attivi' };

export function useElencoFornitori() {
  const [testo, setTesto] = useState('');
  const [filtri, setFiltri] = useState<FiltriFornitori>(FILTRI_INIZIALI);
  const [ordina, setOrdina] = useState<OrdinaFornitori>('nome');

  const [righe, setRighe] = useState<Fornitore[]>([]);
  const [totale, setTotale] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [altre, setAltre] = useState(false);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  const testoRitardato = useRitardato(testo.trim());
  const turno = useRef(0);

  const richiesta = useCallback(
    (p: number) => ({ ...filtri, testo: testoRitardato || undefined, ordina, pagina: p, righe: RIGHE_FORNITORI }),
    [filtri, testoRitardato, ordina]
  );

  const leggi = useCallback(
    async (p: number) => {
      const mio = ++turno.current;
      setCaricamento(true);
      try {
        const l = await leggiElencoFornitori(richiesta(p));
        if (mio !== turno.current) return;
        setRighe(r => (p === 1 ? l.righe : [...r, ...l.righe]));
        setTotale(l.totale);
        setAltre(l.altre);
        setPagina(p);
        setErrore(null);
      } catch (e) {
        if (mio === turno.current) setErrore((e as Error).message);
      } finally {
        if (mio === turno.current) setCaricamento(false);
      }
    },
    [richiesta]
  );

  useEffect(() => {
    void leggi(1);
  }, [leggi]);

  const ricarica = useCallback(() => leggi(1), [leggi]);
  const mostraAltri = useCallback(() => leggi(pagina + 1), [leggi, pagina]);

  const filtriAttivi = !!testo.trim() || !!filtri.tipo || filtri.stato !== 'attivi';
  const azzera = useCallback(() => {
    setTesto('');
    setFiltri(FILTRI_INIZIALI);
  }, []);

  return { testo, setTesto, filtri, setFiltri, ordina, setOrdina, righe, totale, altre, mostraAltri, caricamento, errore, ricarica, filtriAttivi, azzera };
}

export type ElencoFornitori = ReturnType<typeof useElencoFornitori>;
