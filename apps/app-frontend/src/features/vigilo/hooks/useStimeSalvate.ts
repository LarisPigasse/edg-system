// src/features/vigilo/hooks/useStimeSalvate.ts
//
// Le stime salvate (2026-11-18, fase 3): l'elenco, la stima aperta nel
// pannello, il costo reale dopo il servizio ed eliminare. Ogni modifica
// aggiorna l'elenco; vero se è riuscita.
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@edg/ui';

import { eliminaStima, leggiStima, leggiStime, registraCostoReale } from '../api/stima';
import type { StimaRiga, StimaSalvata } from '../types/stima';

export function useStimeSalvate() {
  const [righe, setRighe] = useState<StimaRiga[] | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [aperta, setAperta] = useState<StimaSalvata | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const toast = useToast();

  const carica = useCallback(async () => {
    try {
      setRighe(await leggiStime());
      setErrore(null);
    } catch (e) {
      setErrore((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void carica();
  }, [carica]);

  const apri = async (uuid: string) => {
    try {
      setAperta(await leggiStima(uuid));
    } catch (e) {
      toast?.danger({ title: 'Stima non letta', description: (e as Error).message });
    }
  };

  const reale = async (uuid: string, costo: number | null, note: string | null): Promise<boolean> => {
    setInCorso(true);
    try {
      setAperta(await registraCostoReale(uuid, costo, note));
      toast?.({ title: costo === null ? 'Costo reale tolto' : 'Costo reale salvato' });
      void carica();
      return true;
    } catch (e) {
      toast?.danger({ title: 'Non salvato', description: (e as Error).message });
      return false;
    } finally {
      setInCorso(false);
    }
  };

  const elimina = async (uuid: string): Promise<boolean> => {
    setInCorso(true);
    try {
      await eliminaStima(uuid);
      toast?.({ title: 'Stima eliminata' });
      if (aperta?.uuid === uuid) setAperta(null);
      void carica();
      return true;
    } catch (e) {
      toast?.danger({ title: 'Non eliminata', description: (e as Error).message });
      return false;
    } finally {
      setInCorso(false);
    }
  };

  return { righe, errore, aperta, apri, chiudi: () => setAperta(null), reale, elimina, inCorso, ricarica: carica };
}
