// src/features/sistema/hooks/useAccountAssistibili.ts
//
// Account attivi di un tenant tra cui scegliere chi "vedere" in Assistenza
// (AA4, sola lettura). Si caricano solo quando servono (tenantId non null),
// e solo l'ultima richiesta conta: cambiando tenant non si mescolano elenchi.
import { useEffect, useRef, useState } from 'react';

import { assistenzaApi } from '../api/assistenzaApi';
import type { AccountAssistibile } from '../types/assistenza';

export function useAccountAssistibili(tenantId: number | null) {
  const [account, setAccount] = useState<AccountAssistibile[]>([]);
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const turno = useRef(0);

  useEffect(() => {
    const mio = ++turno.current;
    setAccount([]);
    setErrore(null);
    if (!tenantId) {
      setCaricamento(false);
      return;
    }
    setCaricamento(true);
    assistenzaApi
      .account(tenantId)
      .then(res => {
        if (mio === turno.current) setAccount(res.data ?? []);
      })
      .catch((err: Error) => {
        if (mio === turno.current) setErrore(err.message);
      })
      .finally(() => {
        if (mio === turno.current) setCaricamento(false);
      });
  }, [tenantId]);

  return { account, caricamento, errore };
}
