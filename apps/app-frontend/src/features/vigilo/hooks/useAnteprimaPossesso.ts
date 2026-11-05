// src/features/vigilo/hooks/useAnteprimaPossesso.ts
//
// Mentre si scrive il costo di possesso: la quota mensile, gli errori e
// l'avviso morbido li calcola il servizio (le regole stanno lì), a fine
// digitazione. Solo l'ultima risposta conta e una risposta vale solo per i
// dati da cui è nata: mentre si scrive non resta quella vecchia.
import { useEffect, useRef, useState } from 'react';

import { anteprimaPossesso } from '../api/resoconti';
import type { AnteprimaPossesso, DatiPossesso } from '../types/costoMezzi';
import { useRitardato } from './useRitardato';

export function useAnteprimaPossesso(dati: DatiPossesso | null | undefined, categoria?: string, escludi?: string) {
  const [risposta, setRisposta] = useState<{ chiave: string; anteprima: AnteprimaPossesso } | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const adesso = `${JSON.stringify(dati ?? null)}|${categoria ?? ''}`;
  const chiave = useRitardato(adesso);
  const turno = useRef(0);

  useEffect(() => {
    const mio = ++turno.current;
    const d = JSON.parse(chiave.slice(0, chiave.lastIndexOf('|'))) as DatiPossesso | null;
    const cat = chiave.slice(chiave.lastIndexOf('|') + 1) || undefined;
    if (!d) return;
    anteprimaPossesso(d, cat, escludi)
      .then(anteprima => {
        if (mio !== turno.current) return;
        setRisposta({ chiave, anteprima });
        setErrore(null);
      })
      .catch(e => mio === turno.current && setErrore((e as Error).message));
  }, [chiave, escludi]);

  const valida = !!dati && risposta?.chiave === adesso;
  return { anteprima: valida ? risposta.anteprima : null, errore, inAttesa: !!dati && !valida && !errore };
}
