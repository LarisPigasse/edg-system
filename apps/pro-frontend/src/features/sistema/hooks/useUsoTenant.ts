// src/features/sistema/hooks/useUsoTenant.ts — riepilogo dell'uso di un tenant (fase 2 dei log, ADR117)
//
// Si legge solo con la finestra aperta (tenantId non null) e a ogni cambio di
// periodo; solo l'ultima lettura conta. Un errore resta nella finestra.
import { useCallback, useEffect, useRef, useState } from 'react';

import { getUsoTenant } from '../api/logsApi';
import type { UsoTenant } from '../types/uso';

export function useUsoTenant(tenantId: number | null, giorni: number) {
  const [uso, setUso] = useState<UsoTenant | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const turno = useRef(0);

  const leggi = useCallback(async () => {
    if (tenantId == null) return;
    const mio = ++turno.current;
    setCaricamento(true);
    try {
      const u = await getUsoTenant(tenantId, giorni);
      if (mio === turno.current) {
        setUso(u);
        setErrore(null);
      }
    } catch (e) {
      if (mio === turno.current) setErrore((e as Error).message);
    } finally {
      if (mio === turno.current) setCaricamento(false);
    }
  }, [tenantId, giorni]);

  useEffect(() => {
    if (tenantId == null) {
      setUso(null);
      setErrore(null);
      return;
    }
    void leggi();
  }, [tenantId, leggi]);

  return { uso, errore, caricamento, ricarica: leggi };
}
