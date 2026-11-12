// src/features/vigilo/utils/pdfCalendario.ts
//
// Il calendario di un mese in PDF (report, 2026-11-12): un'agenda giorno per
// giorno, più leggibile di una griglia quando in un giorno cadono molte
// scadenze. Solo le voci del mese (la pagina ha tutta la griglia di 6
// settimane), con i filtri del calendario sotto il titolo; in breve quante
// sono, quante già scadute o in tolleranza, quante con il giorno stimato
// dall'uso e l'arretrato. Regole pure.
import type { ExportReportOptions, PdfSummaryItem } from '@edg/ui';

import { NATURE_TESTO } from '../constants/nature';
import { TIPI } from '../constants/tipiSoggetto';
import type { Calendario, VoceCalendario } from '../types/calendario';
import type { FiltriScadenze, RiferimentoSoggetto } from '../types/scadenze';
import { naturaDi, soggettoDi } from './descrizioneScadenza';
import { giornoCon } from './giorni';
import { maiuscola } from './testo';

export interface DatiPdfCalendario {
  /** "2026-11" */
  mese: string;
  dati: Calendario;
  filtri: Omit<FiltriScadenze, 'testo'>;
  testo: string;
  sedi: RiferimentoSoggetto[];
}

const utc = (giorno: string) => new Date(`${giorno}T00:00:00Z`);

/** "Novembre 2026" */
export const meseInParole = (mese: string) => maiuscola(utc(`${mese}-01`).toLocaleDateString('it-IT', { month: 'long', year: 'numeric', timeZone: 'UTC' }));

/** "lun 3 nov" */
const giornoAgenda = (giorno: string) => utc(giorno).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

const conteggio = (n: number, uno: string, molti: string) => `${n} ${n === 1 ? uno : molti}`;

/** Le voci del mese, per giorno e poi per titolo (pura) */
export const vociDelMese = (mese: string, voci: VoceCalendario[]) =>
  voci.filter(v => v.giorno.startsWith(mese)).sort((a, b) => a.giorno.localeCompare(b.giorno) || a.titolo.localeCompare(b.titolo, 'it'));

/** Le opzioni del PDF del mese (pura) */
export function calendarioPdf(d: DatiPdfCalendario): ExportReportOptions {
  const voci = vociDelMese(d.mese, d.dati.voci);
  const urgenti = voci.filter(v => v.stato === 'scaduta' || v.stato === 'in-tolleranza').length;
  const stimate = voci.filter(v => v.stimata).length;
  const summary: PdfSummaryItem[] = [
    { label: 'Nel mese', value: String(voci.length), note: conteggio(new Set(voci.map(v => v.giorno)).size, 'giorno', 'giorni') },
    { label: 'Già scadute o in tolleranza', value: String(urgenti) },
    { label: 'Giorno stimato dall’uso', value: String(stimate), note: 'km o ore' },
    { label: 'Arretrato', value: String(d.dati.arretrato), note: 'aperte con la data prima di questo mese' },
  ];
  const filtri = [
    d.filtri.tipo && TIPI[d.filtri.tipo].plurale,
    d.filtri.natura && NATURE_TESTO[d.filtri.natura],
    d.filtri.sede && d.sedi.find(s => s.uuid === d.filtri.sede)?.nome,
    d.testo && `"${d.testo}"`,
  ].filter(Boolean);
  let ultimo = '';
  return {
    filename: `calendario-${d.mese}`,
    title: `Calendario · ${meseInParole(d.mese)}`,
    subtitle: [filtri.length ? filtri.join(' · ') : 'Tutte le scadenze aperte', `situazione ${giornoCon('a', d.dati.oggi)}`].join(' · '),
    summary,
    sections: [
      {
        title: 'Agenda',
        head: ['Giorno', 'Scadenza', 'Soggetto', 'Natura', 'Stato'],
        // il giorno solo sulla prima riga del giorno: si legge come un'agenda
        body: voci.map(v => {
          const giorno = v.giorno === ultimo ? '' : `${giornoAgenda(v.giorno)}${v.stimata ? ' (stima)' : ''}`;
          ultimo = v.giorno;
          return [giorno, v.titolo, soggettoDi(v), naturaDi(v), v.testo];
        }),
        empty: 'Nessuna scadenza in questo mese.',
      },
    ],
    orientation: 'landscape',
  };
}
