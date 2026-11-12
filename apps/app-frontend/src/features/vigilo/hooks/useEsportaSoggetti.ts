// src/features/vigilo/hooks/useEsportaSoggetti.ts
//
// Esporta l'elenco dei soggetti come si vede (scheda del tipo, filtri,
// ricerca, ordinamento): legge tutte le righe, non solo le pagine caricate,
// fino a MASSIMO_ESPORTAZIONE; oltre avvisa che il file è parziale.
// Colonne e testi in utils/esportaSoggetti.ts.
import { useState } from 'react';
import { exportTableToCsv, exportTableToPdf, useToast } from '@edg/ui';

import { leggiTuttiSoggetti } from '../api/soggetti';
import { colonneCsvSoggetti, colonnePdfSoggetti, filtriSoggetti } from '../utils/esportaSoggetti';
import { oggiLocale } from '../utils/giorni';
import type { StatoSoggetti } from './useSoggetti';

/** Righe massime di un'esportazione (come le altre di Vigilo) */
const MASSIMO_ESPORTAZIONE = 1024;

export type FormatoEsportazione = 'pdf' | 'csv';

export function useEsportaSoggetti(s: StatoSoggetti) {
  const [inCorso, setInCorso] = useState(false);
  const toast = useToast();

  const esporta = async (formato: FormatoEsportazione) => {
    setInCorso(true);
    try {
      const { righe, troncate } = await leggiTuttiSoggetti(s.base, MASSIMO_ESPORTAZIONE);
      const nome = `soggetti${s.tipo ? `-${s.tipo}` : ''}-${oggiLocale()}`;
      if (formato === 'pdf') {
        exportTableToPdf({
          filename: nome,
          title: 'Soggetti',
          subtitle: filtriSoggetti({
            tipo: s.tipo,
            filtri: s.filtri,
            testo: s.base.testo ?? '',
            ordina: s.ordina,
            categorie: s.categorie,
            sedi: s.sedi,
            righe: righe.length,
          }),
          columns: colonnePdfSoggetti(s.tipo),
          data: righe,
        });
      } else {
        exportTableToCsv({ filename: nome, columns: colonneCsvSoggetti(s.tipo), data: righe });
      }
      if (troncate)
        toast?.({ title: 'Esportazione parziale', description: `Ci sono più di ${MASSIMO_ESPORTAZIONE} soggetti: restringi i filtri per averli tutti.` });
    } catch (e) {
      toast?.danger({ title: 'Esportazione non riuscita', description: (e as Error).message });
    } finally {
      setInCorso(false);
    }
  };

  return { esporta, inCorso };
}
