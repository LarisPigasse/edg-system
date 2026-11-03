// src/features/vigilo/hooks/useTipiFornitore.ts
//
// I tipi di fornitore del catalogo comune (F0), letti una volta: per il
// filtro dell'elenco e per la scelta nel modulo. Se non si riesce a leggerli
// l'elenco resta vuoto (il filtro non compare, il modulo lo dice).
import { useEffect, useState } from 'react';

import { leggiTipiFornitore } from '../api/fornitori';
import type { TipoFornitore } from '../types/fornitori';

export function useTipiFornitore() {
  const [tipi, setTipi] = useState<TipoFornitore[]>([]);
  const [pronti, setPronti] = useState(false);
  useEffect(() => {
    let valido = true;
    leggiTipiFornitore()
      .then(t => valido && setTipi(t))
      .catch(() => valido && setTipi([]))
      .finally(() => valido && setPronti(true));
    return () => {
      valido = false;
    };
  }, []);
  return { tipi, pronti };
}
