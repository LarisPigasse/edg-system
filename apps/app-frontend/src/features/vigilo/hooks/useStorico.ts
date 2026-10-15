// src/features/vigilo/hooks/useStorico.ts
//
// Lo storico di un soggetto, a pagine da 32 ("Mostra altre").
import { useCallback, useEffect, useState } from 'react';

import { leggiStorico } from '../api/soggetti';
import type { RegistrazioneStorico } from '../types/soggetti';

const RIGHE = 32;

export function useStorico(soggetto: string) {
  const [righe, setRighe] = useState<RegistrazioneStorico[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totale, setTotale] = useState(0);
  const [altre, setAltre] = useState(false);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  const carica = useCallback(
    async (p: number) => {
      setCaricamento(true);
      try {
        const l = await leggiStorico(soggetto, p, RIGHE);
        setRighe(r => (p === 1 ? l.righe : [...r, ...l.righe]));
        setTotale(l.totale);
        setAltre(l.altre);
        setPagina(p);
        setErrore(null);
      } catch (e) {
        setErrore((e as Error).message);
      } finally {
        setCaricamento(false);
      }
    },
    [soggetto]
  );

  useEffect(() => {
    void carica(1);
  }, [carica]);

  return { righe, totale, altre, caricamento, errore, mostraAltre: () => carica(pagina + 1) };
}
