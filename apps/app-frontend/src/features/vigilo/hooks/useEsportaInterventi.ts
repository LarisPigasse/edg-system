// src/features/vigilo/hooks/useEsportaInterventi.ts
//
// Interventi e costi per fornitore (report, 2026-11-12): legge dal servizio
// (GET /resoconti/fornitori) con il periodo e l'ambito scelti nella finestra
// e genera il PDF o il CSV. Se nel periodo non c'è niente lo dice, senza
// creare un file vuoto. Vero se il file è stato creato.
import { useState } from 'react';
import { exportReportToPdf, exportTableToCsv, useToast } from '@edg/ui';

import { leggiInterventiFornitori } from '../api/resoconti';
import type { RichiestaInterventiFornitori } from '../types/resoconti';
import { oggiLocale } from '../utils/giorni';
import { colonneCsvInterventi, interventiFornitoriPdf, nomeFileInterventi, righeCsvInterventi, type AmbitoInterventi } from '../utils/pdfInterventiFornitori';

export function useEsportaInterventi() {
  const [inCorso, setInCorso] = useState(false);
  const toast = useToast();

  const esporta = async (formato: 'pdf' | 'csv', richiesta: RichiestaInterventiFornitori, ambito: AmbitoInterventi): Promise<boolean> => {
    setInCorso(true);
    try {
      const d = await leggiInterventiFornitori(richiesta);
      if (!d.interventi) {
        toast?.({ title: 'Nessun intervento', description: 'Nel periodo scelto non ci sono interventi o rifornimenti con questo fornitore.' });
        return false;
      }
      const oggi = oggiLocale();
      if (formato === 'pdf') exportReportToPdf(interventiFornitoriPdf(d, ambito, oggi));
      else exportTableToCsv({ filename: nomeFileInterventi(ambito, oggi), columns: colonneCsvInterventi, data: righeCsvInterventi(d) });
      return true;
    } catch (e) {
      toast?.danger({ title: 'Report non creato', description: (e as Error).message });
      return false;
    } finally {
      setInCorso(false);
    }
  };

  return { esporta, inCorso };
}
