// src/features/vigilo/hooks/useAnalisi.ts — la vista Analisi: legge gli indicatori una volta, e su richiesta
import { useCallback, useEffect, useState } from 'react';

import { leggiAnalisi } from '../api/analisi';
import type { Analisi } from '../types/analisi';

export function useAnalisi() {
  const [dati, setDati] = useState<Analisi | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(true);

  const ricarica = useCallback(async () => {
    setCaricamento(true);
    try {
      setDati(await leggiAnalisi());
      setErrore(null);
    } catch (e) {
      setErrore((e as Error).message);
    } finally {
      setCaricamento(false);
    }
  }, []);

  useEffect(() => {
    void ricarica();
  }, [ricarica]);

  /** Dopo il cambio delle soglie: l'analisi ricalcolata arriva già dal servizio */
  return { dati, errore, caricamento, ricarica, aggiorna: setDati };
}
