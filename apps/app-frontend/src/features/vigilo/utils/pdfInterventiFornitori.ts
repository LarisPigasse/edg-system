// src/features/vigilo/utils/pdfInterventiFornitori.ts
//
// Interventi e costi per fornitore (report, 2026-11-12): il PDF e le colonne
// del CSV. In testa il periodo e l'ambito (tutti, un tipo, un fornitore); in
// breve fornitori, interventi e totale; con più fornitori una tabella
// riassuntiva (dal più costoso, con la quota); poi una sezione per fornitore
// con le righe e il subtotale. Si conta l'importo pagato al fornitore.
// Regole pure: i dati li legge useEsportaInterventi.
import { csvDate, type CsvColumn, type ExportReportOptions, type PdfSection } from '@edg/ui';

import { NATURE_RESOCONTO } from '../constants/resoconti';
import type { InterventiDelFornitore, InterventiFornitori, RigaInterventoFornitore } from '../types/resoconti';
import { giornoBreve } from './giorni';
import { euroCentesimi, periodoTesto } from './resoconti';
import { nomeFileDi } from './testo';

/** L'ambito in parole: "Tutti i fornitori", "Tipo: Officine", "Officina Rossi" */
export type AmbitoInterventi = { tutti: true } | { tipo: string } | { fornitore: string };

const conteggio = (n: number, uno: string, molti: string) => `${n} ${n === 1 ? uno : molti}`;
const soggettoDi = (r: RigaInterventoFornitore) => (r.soggetto ? [r.soggetto.nome, r.soggetto.identificativo].filter(Boolean).join(' ') : '—');
const testoAmbito = (a: AmbitoInterventi) => ('tutti' in a ? 'Tutti i fornitori' : 'tipo' in a ? `Tipo: ${a.tipo}` : a.fornitore);

/** "interventi-fornitori-2026-11-16", "interventi-officina-2026-11-16", "interventi-officina-di-marco-…" */
export const nomeFileInterventi = (a: AmbitoInterventi, oggi: string) =>
  `interventi-${'tutti' in a ? 'fornitori' : nomeFileDi('tipo' in a ? a.tipo : a.fornitore)}-${oggi}`;

const sezioneFornitore = (f: InterventiDelFornitore): PdfSection => ({
  title: [f.nome, f.tipo?.nome, conteggio(f.interventi, 'intervento', 'interventi')].filter(Boolean).join(' · '),
  head: ['Data', 'Soggetto', 'Intervento', 'Natura', 'Riferimento', 'Importo'],
  body: f.righe.map(r => [giornoBreve(r.giorno), soggettoDi(r), r.intervento, NATURE_RESOCONTO[r.natura], r.riferimento ?? '—', r.importo ? euroCentesimi(r.importo) : '—']),
  foot: ['', '', '', '', 'Subtotale', euroCentesimi(f.totale)],
  rightAligned: [5],
});

/** Il PDF (pura) */
export function interventiFornitoriPdf(d: InterventiFornitori, ambito: AmbitoInterventi, oggi: string): ExportReportOptions {
  const piuFornitori = !('fornitore' in ambito);
  const riepilogo: PdfSection = {
    title: 'Per fornitore',
    head: ['Fornitore', 'Tipo', 'Interventi', 'Totale', 'Quota'],
    body: d.fornitori.map(f => [f.nome, f.tipo?.nome ?? '—', String(f.interventi), euroCentesimi(f.totale), `${f.quota}%`]),
    foot: ['Totale', '', String(d.interventi), euroCentesimi(d.totale), d.totale ? '100%' : ''],
    rightAligned: [2, 3, 4],
  };
  return {
    filename: nomeFileInterventi(ambito, oggi),
    title: 'Interventi e costi per fornitore',
    subtitle: `${testoAmbito(ambito)} · ${periodoTesto(d.periodo)}`,
    summary: [
      ...(piuFornitori ? [{ label: 'Fornitori', value: String(d.fornitori.length) }] : []),
      { label: 'Interventi', value: String(d.interventi) },
      { label: 'Totale pagato', value: euroCentesimi(d.totale), note: 'importi ai fornitori' },
    ],
    sections: [...(piuFornitori && d.fornitori.length > 1 ? [riepilogo] : []), ...d.fornitori.map(sezioneFornitore)],
  };
}

/** Una riga del CSV: l'intervento con il suo fornitore */
export type RigaCsvInterventi = RigaInterventoFornitore & { fornitore: string; tipoFornitore: string | null };

/** Le righe del CSV, fornitore per fornitore (pura) */
export const righeCsvInterventi = (d: InterventiFornitori): RigaCsvInterventi[] =>
  d.fornitori.flatMap(f => f.righe.map(r => ({ ...r, fornitore: f.nome, tipoFornitore: f.tipo?.nome ?? null })));

export const colonneCsvInterventi: CsvColumn<RigaCsvInterventi>[] = [
  { header: 'Fornitore', accessor: r => r.fornitore },
  { header: 'Tipo di fornitore', accessor: r => r.tipoFornitore },
  { header: 'Data', accessor: r => csvDate(r.giorno) },
  { header: 'Soggetto', accessor: r => r.soggetto?.nome },
  { header: 'Identificativo', accessor: r => r.soggetto?.identificativo },
  { header: 'Intervento', accessor: r => r.intervento },
  { header: 'Natura', accessor: r => NATURE_RESOCONTO[r.natura] },
  { header: 'Riferimento', accessor: r => r.riferimento },
  { header: 'Litri', accessor: r => r.litri },
  { header: 'Importo (€)', accessor: r => r.importo },
];
