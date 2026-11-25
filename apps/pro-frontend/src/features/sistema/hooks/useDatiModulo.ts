// src/features/sistema/hooks/useDatiModulo.ts — riepilogo dei dati di un tenant in un modulo (fase 3)
import { useCallback, useEffect, useRef, useState } from 'react';

import { leggiDatiModulo } from '../api/datiModuliApi';
import type { RiepilogoDati } from '../types/datiModuli';

export function useDatiModulo(modulo: string, idTenant: number | null) {
  const [riepilogo, setRiepilogo] = useState<RiepilogoDati | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const turno = useRef(0);

  const ricarica = useCallback(async () => {
    if (idTenant == null) return;
    const mio = ++turno.current;
    setCaricamento(true);
    try {
      const r = await leggiDatiModulo(modulo, idTenant);
      if (mio === turno.current) {
        setRiepilogo(r);
        setErrore(null);
      }
    } catch (e) {
      if (mio === turno.current) setErrore((e as Error).message);
    } finally {
      if (mio === turno.current) setCaricamento(false);
    }
  }, [modulo, idTenant]);

  useEffect(() => {
    void ricarica();
  }, [ricarica]);

  return { riepilogo, errore, caricamento, ricarica };
}
