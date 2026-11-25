// src/features/sistema/hooks/useUltimoUso.ts — ultimo uso di ogni tenant (colonna della lista, fase 2 dei log)
//
// Solo per chi vede i log (sistema.logs): per gli altri non si legge niente e
// la colonna non c'è. Se log-service non risponde la colonna mostra "—": la
// lista dei tenant non deve dipendere dai log.
import { useCallback, useEffect, useMemo, useState } from 'react';

import { getUltimoUsoTenant } from '../api/logsApi';
import type { UltimoUsoTenant } from '../types/uso';

export function useUltimoUso(attivo: boolean) {
  const [righe, setRighe] = useState<UltimoUsoTenant[]>([]);
  const [giorni, setGiorni] = useState<number | null>(null);

  const ricarica = useCallback(async () => {
    if (!attivo) return;
    try {
      const r = await getUltimoUsoTenant();
      setRighe(r.tenant);
      setGiorni(r.giorni);
    } catch {
      setRighe([]);
    }
  }, [attivo]);

  useEffect(() => {
    void ricarica();
  }, [ricarica]);

  const perTenant = useMemo(() => new Map(righe.map(r => [r.tenantId, r])), [righe]);
  return { ultimoUsoDi: (tenantId: number) => perTenant.get(tenantId) ?? null, giorni, ricarica };
}
