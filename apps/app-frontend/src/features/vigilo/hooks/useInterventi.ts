// src/features/vigilo/hooks/useInterventi.ts
//
// Le regole degli interventi del tenant (passo 8): costo orario predefinito
// (solo vigilo.costi) e giorni per riparare un guasto. Senza permesso la
// lettura fallisce in silenzio e il riquadro non compare. Salva restituisce
// true se è andato a buon fine, così il pannello si chiude solo allora.
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@edg/ui';

import { cambiaInterventi, leggiInterventi } from '../api/impostazioni';
import type { RegoleInterventi, SchedaInterventi } from '../types/impostazioni';

export function useInterventi() {
  const toast = useToast();
  const [scheda, setScheda] = useState<SchedaInterventi | null>(null);
  const [inCorso, setInCorso] = useState(false);

  const ricarica = useCallback(async () => {
    try {
      setScheda(await leggiInterventi());
    } catch {
      setScheda(null);
    }
  }, []);

  useEffect(() => {
    void ricarica();
  }, [ricarica]);

  const salva = async (modifica: Partial<RegoleInterventi>): Promise<boolean> => {
    setInCorso(true);
    try {
      setScheda((await cambiaInterventi(modifica)).data);
      toast?.({ title: 'Regole degli interventi salvate' });
      return true;
    } catch (e) {
      toast?.danger({ title: 'Regole non salvate', description: (e as Error).message });
      return false;
    } finally {
      setInCorso(false);
    }
  };

  return { scheda, inCorso, ricarica, salva };
}
