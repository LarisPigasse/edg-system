// src/features/vigilo/hooks/useCostoMezzi.ts
//
// Il costo stimato dei mezzi (tappa 1): con i filtri di Spese e consumi, o di
// un solo mezzo negli ultimi 12 mesi (scheda del mezzo). Rilegge quando
// cambiano i filtri o `chiave` (es. dopo una modifica del mezzo); con
// `attivo` falso non chiede nulla. Solo l'ultima richiesta conta.
import { useEffect, useRef, useState } from 'react';

import { leggiCostoMezzi } from '../api/resoconti';
import type { CostoMezzi } from '../types/costoMezzi';
import type { FiltriSpese } from '../types/resoconti';

export function useCostoMezzi(filtri: Partial<FiltriSpese> & { soggetto?: string }, attivo = true, chiave?: string) {
  const [dati, setDati] = useState<CostoMezzi | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(attivo);
  const turno = useRef(0);
  const richiesta = JSON.stringify(filtri);

  useEffect(() => {
    if (!attivo) return;
    const mio = ++turno.current;
    setCaricamento(true);
    leggiCostoMezzi(JSON.parse(richiesta))
      .then(d => {
        if (mio !== turno.current) return;
        setDati(d);
        setErrore(null);
      })
      .catch(e => mio === turno.current && setErrore((e as Error).message))
      .finally(() => mio === turno.current && setCaricamento(false));
  }, [richiesta, attivo, chiave]);

  return { dati, errore, caricamento };
}
