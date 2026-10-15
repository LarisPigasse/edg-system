// src/features/vigilo/hooks/useConfigurazione.ts
//
// Categorie, controlli e stato dell'avvio del cliente, raggruppati per tipo di
// soggetto come li mostra la pagina Configurazione.
import { useCallback, useEffect, useMemo, useState } from 'react';

import { leggiStatoAvvio } from '../api/avvio';
import { leggiCategorie, leggiControlli } from '../api/configurazione';
import type { StatoAvvio } from '../types/avvio';
import type { Categoria, Controllo } from '../types/configurazione';
import { TIPI_SOGGETTO, type TipoSoggetto } from '../types/valori';

export interface GruppoConfigurazione {
  tipo: TipoSoggetto;
  categorie: Categoria[];
  controlli: Controllo[];
}

export function useConfigurazione() {
  const [categorie, setCategorie] = useState<Categoria[] | null>(null);
  const [controlli, setControlli] = useState<Controllo[] | null>(null);
  const [stato, setStato] = useState<StatoAvvio | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(true);

  const ricarica = useCallback(async () => {
    setCaricamento(true);
    try {
      const [cat, ctrl, st] = await Promise.all([leggiCategorie(), leggiControlli(), leggiStatoAvvio()]);
      setCategorie(cat);
      setControlli(ctrl);
      setStato(st);
      setErrore(null);
    } catch (e) {
      setErrore((e as Error).message);
    } finally {
      setCaricamento(false);
    }
  }, []);

  useEffect(() => {
    void ricarica();
  }, [ricarica]);

  const gruppi = useMemo<GruppoConfigurazione[]>(
    () =>
      TIPI_SOGGETTO.map(tipo => ({
        tipo,
        categorie: (categorie ?? []).filter(c => c.tipoSoggetto === tipo),
        controlli: (controlli ?? []).filter(c => c.tipoSoggetto === tipo),
      })).filter(g => g.categorie.length || g.controlli.length),
    [categorie, controlli]
  );

  return { gruppi, stato, errore, caricamento, ricarica, vuota: !caricamento && !errore && gruppi.length === 0 };
}
