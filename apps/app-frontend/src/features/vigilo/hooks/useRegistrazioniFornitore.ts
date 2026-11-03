// src/features/vigilo/hooks/useRegistrazioniFornitore.ts
//
// Le registrazioni che citano un fornitore, dalla più recente, a pagine da 8
// ("Mostra altre"): per il dettaglio del fornitore (F1). Senza fornitore
// (dettaglio chiuso) non legge nulla.
import { useCallback, useEffect, useRef, useState } from 'react';

import { leggiRegistrazioniFornitore } from '../api/fornitori';
import { RIGHE_STORICO_FORNITORE } from '../constants/fornitori';
import type { RegistrazioneFornitore } from '../types/fornitori';

export function useRegistrazioniFornitore(fornitore: string | null) {
  const [righe, setRighe] = useState<RegistrazioneFornitore[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totale, setTotale] = useState(0);
  const [altre, setAltre] = useState(false);
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const turno = useRef(0);

  const carica = useCallback(
    async (p: number) => {
      if (!fornitore) return;
      const mio = ++turno.current;
      setCaricamento(true);
      try {
        const l = await leggiRegistrazioniFornitore(fornitore, p, RIGHE_STORICO_FORNITORE);
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
    [fornitore]
  );

  useEffect(() => {
    setRighe([]);
    setTotale(0);
    setAltre(false);
    void carica(1);
  }, [carica]);

  return { righe, totale, altre, caricamento, errore, mostraAltre: () => carica(pagina + 1) };
}
