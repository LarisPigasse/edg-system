// src/features/vigilo/hooks/useMieiMezzi.ts
//
// I mezzi che l'addetto ha assegnati oggi, con i contatori (B9b): l'elenco lo
// restringe il servizio al suo ambito; il dettaglio di ciascuno porta i
// contatori. Sono pochi per natura.
import { useCallback, useEffect, useState } from 'react';

import { leggiSoggetti, leggiSoggetto } from '../api/soggetti';
import type { Soggetto } from '../types/soggetti';

export function useMieiMezzi(attivo: boolean) {
  const [mezzi, setMezzi] = useState<Soggetto[] | null>(null);
  const [errore, setErrore] = useState<string | null>(null);

  const ricarica = useCallback(async () => {
    if (!attivo) return;
    try {
      const { righe } = await leggiSoggetti({ ordina: 'nome', pagina: 1, righe: 128, stato: 'attivi' });
      setMezzi(await Promise.all(righe.filter(s => s.tipo !== 'persona').map(s => leggiSoggetto(s.uuid))));
      setErrore(null);
    } catch (e) {
      setErrore((e as Error).message);
    }
  }, [attivo]);

  useEffect(() => {
    void ricarica();
  }, [ricarica]);

  return { mezzi, errore, ricarica };
}
