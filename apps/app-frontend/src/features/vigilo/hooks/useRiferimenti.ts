// src/features/vigilo/hooks/useRiferimenti.ts
//
// Le scelte del modulo di un soggetto: le categorie (con i campi aggiuntivi;
// `categorieDel(tipo)` dà quelle attive di un tipo), le sedi e le persone.
// Lette una volta.
import { useCallback, useEffect, useState } from 'react';

import { leggiCategorie } from '../api/configurazione';
import { leggiPersone, leggiSedi } from '../api/soggetti';
import type { Categoria } from '../types/configurazione';
import type { RiferimentoSoggetto } from '../types/scadenze';
import type { TipoSoggetto } from '../types/valori';

export function useRiferimenti() {
  const [tutteLeCategorie, setCategorie] = useState<Categoria[]>([]);
  const [sedi, setSedi] = useState<RiferimentoSoggetto[]>([]);
  const [persone, setPersone] = useState<RiferimentoSoggetto[]>([]);
  const [pronti, setPronti] = useState(false);

  useEffect(() => {
    let valido = true;
    Promise.all([leggiCategorie().catch(() => []), leggiSedi().catch(() => []), leggiPersone().catch(() => [])]).then(([c, s, p]) => {
      if (!valido) return;
      setCategorie(c);
      setSedi(s);
      setPersone(p);
      setPronti(true);
    });
    return () => {
      valido = false;
    };
  }, []);

  const categorieDel = useCallback(
    (tipo: TipoSoggetto | null) => tutteLeCategorie.filter(c => c.tipoSoggetto === tipo && c.attiva),
    [tutteLeCategorie]
  );

  return { tutteLeCategorie, categorieDel, sedi, persone, pronti };
}

export type Riferimenti = ReturnType<typeof useRiferimenti>;
