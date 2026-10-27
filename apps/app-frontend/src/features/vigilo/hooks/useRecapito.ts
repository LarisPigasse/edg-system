// src/features/vigilo/hooks/useRecapito.ts
//
// La pagina pubblica "Non ricevere più questi avvisi" (B8d-4): legge il
// recapito del codice e lo cambia. Senza codice nell'indirizzo è come un
// collegamento non valido, senza chiamare il servizio.
import { useCallback, useEffect, useState } from 'react';

import { ErroreRecapito, cambiaRecapito, leggiRecapito } from '../api/recapiti';
import type { SchedaRecapito } from '../types/recapiti';

export type ProblemaRecapito = 'non-valido' | 'troppe-richieste' | 'altro';

const problemaDi = (e: unknown): ProblemaRecapito =>
  e instanceof ErroreRecapito && e.stato === 404 ? 'non-valido' : e instanceof ErroreRecapito && e.stato === 429 ? 'troppe-richieste' : 'altro';

export function useRecapito(codice: string | null) {
  const [scheda, setScheda] = useState<SchedaRecapito | null>(null);
  const [problema, setProblema] = useState<ProblemaRecapito | null>(codice ? null : 'non-valido');
  const [inCorso, setInCorso] = useState(false);
  /** Che cosa è appena cambiato, per la riga di conferma */
  const [appena, setAppena] = useState<'escluso' | 'riattivato' | null>(null);

  const carica = useCallback(async () => {
    if (!codice) return;
    setProblema(null);
    try {
      setScheda(await leggiRecapito(codice));
    } catch (e) {
      setProblema(problemaDi(e));
    }
  }, [codice]);

  useEffect(() => {
    void carica();
  }, [carica]);

  const cambia = async (escluso: boolean) => {
    if (!codice) return;
    setInCorso(true);
    try {
      setScheda(await cambiaRecapito(codice, escluso));
      setAppena(escluso ? 'escluso' : 'riattivato');
      setProblema(null);
    } catch (e) {
      setProblema(problemaDi(e));
    } finally {
      setInCorso(false);
    }
  };

  return { scheda, problema, inCorso, appena, carica, cambia };
}
