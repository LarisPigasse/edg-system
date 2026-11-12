// src/features/vigilo/utils/esportaStorico.ts
//
// Lo storico di un soggetto in PDF e CSV (report, 2026-11-12). Il PDF ha le
// colonne della scheda (data, scadenza, che cosa, dettagli con l'autore); il
// CSV le separa, con le ore di manodopera e, a chi segue i costi, importo e
// costo totale come numeri da sommare in Excel.
import { csvDate, type CsvColumn, type PdfColumn } from '@edg/ui';

import type { RegistrazioneStorico } from '../types/soggetti';
import { giornoBreve } from './giorni';
import { descrizioneRegistrazione, dettagliRegistrazione } from './registrazioni';

export const colonnePdfStorico: PdfColumn<RegistrazioneStorico>[] = [
  { header: 'Data', accessor: r => giornoBreve(r.eseguitaIl) },
  { header: 'Scadenza', accessor: r => r.scadenza?.titolo ?? '—' },
  { header: 'Che cosa', accessor: descrizioneRegistrazione },
  { header: 'Dettagli', accessor: r => dettagliRegistrazione(r) || '—' },
];

const oreManodopera = (r: RegistrazioneStorico) => r.manodopera.reduce((n, m) => n + m.ore, 0);

export const colonneCsvStorico = (conCosti: boolean): CsvColumn<RegistrazioneStorico>[] => [
  { header: 'Data', accessor: r => csvDate(r.eseguitaIl) },
  { header: 'Scadenza', accessor: r => r.scadenza?.titolo },
  { header: 'Che cosa', accessor: descrizioneRegistrazione },
  { header: 'Registrata da', accessor: r => (r.automatica ? 'automatica' : r.registrataDa) },
  { header: 'Confermata da', accessor: r => r.confermataDa },
  { header: 'Fornitore', accessor: r => r.fornitore?.nome },
  { header: 'Riferimento', accessor: r => r.riferimento },
  { header: 'Ore di manodopera', accessor: r => (r.manodopera.length ? oreManodopera(r) : null) },
  ...(conCosti
    ? [
        { header: 'Importo (€)', accessor: (r: RegistrazioneStorico) => r.importo ?? null },
        { header: 'Costo totale (€)', accessor: (r: RegistrazioneStorico) => r.costoTotale ?? null },
      ]
    : []),
  { header: 'Note', accessor: r => r.note },
];
