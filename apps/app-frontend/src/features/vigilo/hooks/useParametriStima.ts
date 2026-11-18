// src/features/vigilo/hooks/useParametriStima.ts
//
// I parametri della stima dei costi (2026-11-17): lettura e le tre modifiche
// (parametri generali, costi di un anno, eliminazione di un anno). Ogni
// modifica risponde con i parametri aggiornati; vero se è riuscita.
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@edg/ui';

import { cambiaParametriStima, eliminaCostiAnno, leggiParametriStima, salvaCostiAnno } from '../api/stima';
import type { DatiAnno, ParametriStima, RegoleStima } from '../types/stima';

export function useParametriStima() {
  const [dati, setDati] = useState<ParametriStima | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const toast = useToast();

  const carica = useCallback(async () => {
    try {
      setDati(await leggiParametriStima());
      setErrore(null);
    } catch (e) {
      setErrore((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void carica();
  }, [carica]);

  const esegui = async (azione: () => Promise<ParametriStima>, fatto: string): Promise<boolean> => {
    setInCorso(true);
    try {
      setDati(await azione());
      toast?.({ title: fatto });
      return true;
    } catch (e) {
      toast?.danger({ title: 'Non salvato', description: (e as Error).message });
      return false;
    } finally {
      setInCorso(false);
    }
  };

  return {
    dati,
    errore,
    inCorso,
    ricarica: carica,
    cambiaGenerali: (m: Partial<RegoleStima>) => esegui(() => cambiaParametriStima(m), 'Parametri aggiornati'),
    salvaAnno: (anno: number, d: DatiAnno) => esegui(() => salvaCostiAnno(anno, d), `Costi aziendali ${anno} salvati`),
    eliminaAnno: (anno: number) => esegui(() => eliminaCostiAnno(anno), `Costi aziendali ${anno} eliminati`),
  };
}
