// src/features/vigilo/hooks/useEsportaConfigurazione.ts
//
// I report di Configurazione (report, 2026-11-12): il Piano dei controlli
// (con i dati già letti dalla pagina, utils/pdfPianoControlli.ts) e
// "Controlli non seguiti", in corso o con lo storico. Se non c'è niente lo
// dice, senza generare un PDF vuoto; oltre il massimo del servizio avvisa
// che è parziale.
import { useState } from 'react';
import { exportReportToPdf, exportTableToPdf, useToast } from '@edg/ui';

import { leggiNonSeguiti } from '../api/controlliSoggetto';
import type { QualiDecisioni } from '../types/controlliSoggetto';
import { colonneNonSeguiti, sottotitoloNonSeguiti } from '../utils/esportaNonSeguiti';
import { pianoControlliPdf, type DatiPianoControlli } from '../utils/pdfPianoControlli';
import { oggiLocale } from '../utils/giorni';

export function useEsportaConfigurazione() {
  const [inCorso, setInCorso] = useState(false);
  const toast = useToast();

  const nonSeguiti = async (quali: QualiDecisioni) => {
    setInCorso(true);
    try {
      const { righe, troncate } = await leggiNonSeguiti(quali);
      if (!righe.length) {
        toast?.({
          title: 'Nessun controllo non seguito',
          description: quali === 'in-corso' ? 'Oggi tutti i controlli si seguono per tutti i soggetti.' : 'Nessuna decisione registrata finora.',
        });
        return;
      }
      exportTableToPdf({
        filename: `controlli-non-seguiti${quali === 'tutte' ? '-storico' : ''}-${oggiLocale()}`,
        title: 'Controlli non seguiti',
        subtitle: sottotitoloNonSeguiti(quali, righe.length),
        columns: colonneNonSeguiti(quali),
        data: righe,
      });
      if (troncate) toast?.({ title: 'Report parziale', description: 'Ci sono più decisioni di quelle che entrano nel report.' });
    } catch (e) {
      toast?.danger({ title: 'Report non creato', description: (e as Error).message });
    } finally {
      setInCorso(false);
    }
  };

  /** Il Piano dei controlli: i dati li ha già la pagina */
  const piano = (d: Omit<DatiPianoControlli, 'oggi'>) => {
    try {
      exportReportToPdf(pianoControlliPdf({ ...d, oggi: oggiLocale() }));
    } catch (e) {
      toast?.danger({ title: 'Piano non creato', description: (e as Error).message });
    }
  };

  return { nonSeguiti, piano, inCorso };
}
