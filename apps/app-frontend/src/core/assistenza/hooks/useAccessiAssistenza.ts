// src/core/assistenza/hooks/useAccessiAssistenza.ts
//
// Gli accessi dell'assistenza EDG nel mio tenant (AA5). Solo l'ultima
// lettura conta: con "Aggiorna" ripetuto non si mescolano risposte vecchie.
import { useCallback, useEffect, useRef, useState } from 'react';

import { leggiAccessiAssistenza } from '../api';
import type { AccessoAssistenza } from '../types';

export function useAccessiAssistenza() {
  const [accessi, setAccessi] = useState<AccessoAssistenza[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const turno = useRef(0);

  const carica = useCallback(async () => {
    const mio = ++turno.current;
    setCaricamento(true);
    try {
      const righe = await leggiAccessiAssistenza();
      if (mio !== turno.current) return;
      setAccessi(righe);
      setErrore(null);
    } catch (err) {
      if (mio === turno.current) setErrore((err as Error).message);
    } finally {
      if (mio === turno.current) setCaricamento(false);
    }
  }, []);

  useEffect(() => {
    void carica();
  }, [carica]);

  return { accessi, caricamento, errore, ricarica: carica };
}

export type StatoAccessiAssistenza = ReturnType<typeof useAccessiAssistenza>;
