// src/features/vigilo/hooks/useFornitori.ts
//
// I fornitori del cliente, per scegliere chi ha eseguito un controllo.
// Si leggono solo se servono (`attivo`); se non si riesce, l'elenco resta
// vuoto e il campo semplicemente non compare.
import { useEffect, useState } from 'react';

import { leggiFornitori } from '../api/fornitori';
import type { Fornitore } from '../types/fornitori';

export function useFornitori(attivo: boolean): Fornitore[] {
  const [fornitori, setFornitori] = useState<Fornitore[]>([]);
  useEffect(() => {
    if (!attivo) return;
    let valido = true;
    leggiFornitori()
      .then(f => valido && setFornitori(f))
      .catch(() => valido && setFornitori([]));
    return () => {
      valido = false;
    };
  }, [attivo]);
  return fornitori;
}
