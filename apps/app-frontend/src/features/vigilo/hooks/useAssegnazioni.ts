// src/features/vigilo/hooks/useAssegnazioni.ts
//
// Chi usa un mezzo, o quali mezzi usa una persona: in corso e passate.
import { useEffect, useState } from 'react';

import { leggiAssegnazioni } from '../api/soggetti';
import type { Assegnazione } from '../types/soggetti';

export function useAssegnazioni(uuid: string, comePersona: boolean) {
  const [righe, setRighe] = useState<Assegnazione[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    let valido = true;
    setCaricamento(true);
    leggiAssegnazioni(comePersona ? { persona: uuid } : { soggetto: uuid })
      .then(r => valido && (setRighe(r), setErrore(null)))
      .catch((e: Error) => valido && setErrore(e.message))
      .finally(() => valido && setCaricamento(false));
    return () => {
      valido = false;
    };
  }, [uuid, comePersona]);

  return { righe, caricamento, errore };
}
