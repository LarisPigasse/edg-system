// src/features/vigilo/hooks/useRegoleAvvisi.ts
//
// Le regole degli avvisi del tenant (B8d-2): lettura, salvataggio e ritorno
// ai predefiniti, con il toast. Salva restituisce true se è andato a buon
// fine, così il pannello si chiude solo allora.
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@edg/ui';

import { cambiaRegoleAvvisi, leggiRegoleAvvisi, ripristinaRegoleAvvisi } from '../api/impostazioni';
import type { RegoleAvvisi, SchedaRegoleAvvisi } from '../types/impostazioni';
import { fraseRegole } from '../utils/regoleAvvisi';

export function useRegoleAvvisi() {
  const toast = useToast();
  const [scheda, setScheda] = useState<SchedaRegoleAvvisi | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);

  const ricarica = useCallback(async () => {
    try {
      setScheda(await leggiRegoleAvvisi());
      setErrore(null);
    } catch (e) {
      setErrore((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void ricarica();
  }, [ricarica]);

  /** Il toast dice le regole in vigore dopo l'azione, come le ha restituite il servizio */
  const esegui = async (azione: () => Promise<{ data: SchedaRegoleAvvisi }>, titolo: string): Promise<boolean> => {
    setInCorso(true);
    try {
      const nuova = (await azione()).data;
      setScheda(nuova);
      const frase = fraseRegole(nuova.regole);
      toast?.({ title: titolo, description: `${frase.charAt(0).toUpperCase()}${frase.slice(1)}.` });
      return true;
    } catch (e) {
      toast?.danger({ title: 'Regole non salvate', description: (e as Error).message });
      return false;
    } finally {
      setInCorso(false);
    }
  };

  const salva = (r: RegoleAvvisi) => esegui(() => cambiaRegoleAvvisi(r), 'Regole degli avvisi salvate');

  const ripristina = () => esegui(ripristinaRegoleAvvisi, 'Regole predefinite');

  return { scheda, errore, inCorso, ricarica, salva, ripristina };
}

export type StatoRegoleAvvisi = ReturnType<typeof useRegoleAvvisi>;
