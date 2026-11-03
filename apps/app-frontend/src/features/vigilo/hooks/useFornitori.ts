// src/features/vigilo/hooks/useFornitori.ts
//
// I fornitori attivi del cliente, per scegliere chi ha eseguito un controllo.
// Si leggono solo se servono (`attivo`); se non si riesce, l'elenco resta
// vuoto. `aggiungi` mette in elenco, in ordine di nome, un fornitore appena
// creato dal modulo (F2), senza rileggere.
import { useCallback, useEffect, useState } from 'react';

import { leggiFornitori } from '../api/fornitori';
import type { Fornitore } from '../types/fornitori';

export function useFornitori(attivo: boolean) {
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

  const aggiungi = useCallback(
    (f: Fornitore) => setFornitori(l => [...l.filter(x => x.uuid !== f.uuid), f].sort((a, b) => a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' }))),
    []
  );

  return { fornitori, aggiungi };
}
