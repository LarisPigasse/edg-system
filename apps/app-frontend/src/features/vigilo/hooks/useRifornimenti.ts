// src/features/vigilo/hooks/useRifornimenti.ts
//
// I rifornimenti di un mezzo, dal più recente, a pagine ("Mostra altri").
// Si rileggono da capo quando cambia `versione` (dopo un salvataggio).
import { useCallback, useEffect, useState } from 'react';

import { leggiRifornimenti } from '../api/rifornimenti';
import type { Rifornimento } from '../types/rifornimenti';

export function useRifornimenti(soggetto: string, righePerPagina: number, versione = 0) {
  const [righe, setRighe] = useState<Rifornimento[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totale, setTotale] = useState(0);
  const [altre, setAltre] = useState(false);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  const carica = useCallback(
    async (p: number) => {
      setCaricamento(true);
      try {
        const l = await leggiRifornimenti(soggetto, p, righePerPagina);
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
    [soggetto, righePerPagina]
  );

  useEffect(() => {
    void carica(1);
  }, [carica, versione]);

  return { righe, totale, altre, caricamento, errore, mostraAltri: () => carica(pagina + 1), ricarica: () => carica(1) };
}
