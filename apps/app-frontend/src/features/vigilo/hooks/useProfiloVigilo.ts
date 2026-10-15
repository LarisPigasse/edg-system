// src/features/vigilo/hooks/useProfiloVigilo.ts
//
// Che cosa Vigilo sa dell'utente (GET /me): capacità, avvio fatto, persona
// collegata. È la fonte per decidere che cosa mostrare; i permessi veri li
// controlla comunque il servizio.
import { useCallback, useEffect, useState } from 'react';

import { leggiProfilo } from '../api/io';
import type { ProfiloVigilo } from '../types/io';

export function useProfiloVigilo() {
  const [profilo, setProfilo] = useState<ProfiloVigilo | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(true);

  const ricarica = useCallback(async () => {
    setCaricamento(true);
    try {
      setProfilo(await leggiProfilo());
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

  return { profilo, errore, caricamento, ricarica };
}
