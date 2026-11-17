// src/features/vigilo/hooks/useEsportazione.ts
//
// Esportare un elenco in PDF o CSV (report, 2026-11-12), uguale per tutte le
// schede: legge le righe (fino al massimo della lettura), se non ce ne sono
// lo dice senza creare un file vuoto, genera il PDF (exportTableToPdf) o il
// CSV (exportTableToCsv) e avvisa se le righe erano troppe. Chi lo usa dà
// solo come leggere e le colonne: utils/esporta*.ts.
import { useState } from 'react';
import { exportTableToCsv, exportTableToPdf, useToast, type CsvColumn, type PdfColumn } from '@edg/ui';

import type { LetturaCompleta } from '../api/client';
import { oggiLocale } from '../utils/giorni';

export interface Esportazione<T> {
  leggi: () => Promise<LetturaCompleta<T>>;
  /** Senza data né estensione: "storico-daf-xf-01" */
  nomeFile: string;
  titolo: string;
  /** Sotto il titolo, dato il numero di righe */
  sottotitolo: (righe: number) => string;
  colonnePdf: PdfColumn<T>[];
  colonneCsv: CsvColumn<T>[];
  /** Il messaggio quando non c'è niente */
  vuoto: string;
}

export type FormatoEsportazione = 'pdf' | 'csv';

export function useEsportazione<T>(e: Esportazione<T>) {
  const [inCorso, setInCorso] = useState(false);
  const toast = useToast();

  const esporta = async (formato: FormatoEsportazione) => {
    setInCorso(true);
    try {
      const { righe, troncate } = await e.leggi();
      if (!righe.length) {
        toast?.({ title: 'Niente da esportare', description: e.vuoto });
        return;
      }
      const filename = `${e.nomeFile}-${oggiLocale()}`;
      if (formato === 'pdf') exportTableToPdf({ filename, title: e.titolo, subtitle: e.sottotitolo(righe.length), columns: e.colonnePdf, data: righe });
      else exportTableToCsv({ filename, columns: e.colonneCsv, data: righe });
      if (troncate) toast?.({ title: 'Esportazione parziale', description: `Sono entrate le prime ${righe.length} righe.` });
    } catch (err) {
      toast?.danger({ title: 'Esportazione non riuscita', description: (err as Error).message });
    } finally {
      setInCorso(false);
    }
  };

  return { esporta, inCorso };
}
