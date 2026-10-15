// src/features/vigilo/utils/pdfScadenze.ts
//
// Le colonne del PDF dell'elenco delle scadenze (exportTableToPdf di
// @edg/ui): le stesse della tabella, tutte come testo.
import type { PdfColumn } from '@edg/ui';

import type { Scadenza } from '../types/scadenze';
import { chiusuraDi, naturaDi, quandoDi, soggettoDi } from './descrizioneScadenza';

export const colonnePdf = (chiuse: boolean): PdfColumn<Scadenza>[] => [
  { header: 'Scadenza', accessor: s => s.titolo },
  { header: 'Soggetto', accessor: soggettoDi },
  { header: 'Natura', accessor: naturaDi },
  chiuse ? { header: 'Chiusa', accessor: chiusuraDi } : { header: 'Stato', accessor: s => s.testo },
  { header: 'Data o soglia', accessor: quandoDi },
];
