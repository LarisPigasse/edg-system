// src/features/vigilo/utils/pdfPianoControlli.ts
//
// Il Piano dei controlli in PDF (report, 2026-11-12), da Configurazione: il
// documento del "sistema di gestione delle scadenze". In testa le impostazioni
// (settori applicati, predefiniti, regole degli avvisi); in breve quanti
// controlli attivi per tipo di soggetto; poi una sezione per tipo con ogni
// controllo attivo nelle parole della pagina (cadenza, avvisi e tolleranza,
// categorie, a chi vanno gli avvisi, riferimento normativo); in fondo i
// controlli disattivati, se ci sono. Regole pure: i dati li ha la pagina.
import type { ExportReportOptions, PdfSection, PdfSummaryItem } from '@edg/ui';

import { NATURE_TESTO } from '../constants/nature';
import { TIPI } from '../constants/tipiSoggetto';
import type { GruppoConfigurazione } from '../hooks/useConfigurazione';
import type { StatoAvvio } from '../types/avvio';
import type { Controllo } from '../types/configurazione';
import type { RegoleAvvisi } from '../types/impostazioni';
import { fraseDestinatari } from './destinatari';
import { giornoCon } from './giorni';
import { frasePreavvisi, fraseTolleranza } from './predefiniti';
import { fraseRegole } from './regoleAvvisi';
import { maiuscola } from './testo';

export interface DatiPianoControlli {
  gruppi: GruppoConfigurazione[];
  stato: StatoAvvio;
  /** null se non lette: la riga si salta */
  regole: RegoleAvvisi | null;
  oggi: string;
}

const conteggio = (n: number, uno: string, molti: string) => `${n} ${n === 1 ? uno : molti}`;
const perOrdine = (a: Controllo, b: Controllo) => a.ordine - b.ordine || a.nome.localeCompare(b.nome, 'it');

/** "Tagliando" e, sotto, il riferimento normativo se c'è */
const nomeDi = (c: Controllo) => [c.nome, c.riferimentoNormativo].filter(Boolean).join('\n');
/** "Manutenzione · automatico · rinnovo tacito" */
const naturaDi = (c: Controllo) => [NATURE_TESTO[c.natura], c.automatico ? 'automatico' : 'a mano', c.rinnovo === 'tacito' ? 'rinnovo tacito' : null].filter(Boolean).join(' · ');
const categorieDi = (c: Controllo) => (c.categorie.length ? c.categorie.map(k => k.nome).join(', ') : 'tutte');

function sezioneTipo(g: GruppoConfigurazione): PdfSection | null {
  const attivi = g.controlli.filter(c => c.attivo).sort(perOrdine);
  if (!attivi.length) return null;
  return {
    title: `${TIPI[g.tipo].plurale} · ${conteggio(attivi.length, 'controllo', 'controlli')}`,
    head: ['Controllo', 'Natura', 'Categorie', 'Cadenza', 'Avvisi e tolleranza', 'Avvisi a'],
    body: attivi.map(c => [nomeDi(c), naturaDi(c), categorieDi(c), c.frasi.cadenza, [c.frasi.preavvisi, c.frasi.tolleranza].filter(Boolean).join(' · '), fraseDestinatari(c.destinatari)]),
  };
}

function sezioneDisattivati(gruppi: GruppoConfigurazione[]): PdfSection | null {
  const spenti = gruppi.flatMap(g => g.controlli.filter(c => !c.attivo).sort(perOrdine).map(c => ({ g, c })));
  if (!spenti.length) return null;
  return {
    title: 'Controlli disattivati',
    head: ['Tipo', 'Controllo', 'Natura', 'Categorie'],
    body: spenti.map(({ g, c }) => [TIPI[g.tipo].plurale, nomeDi(c), NATURE_TESTO[c.natura], categorieDi(c)]),
  };
}

/** Le opzioni del PDF del Piano dei controlli (pura) */
export function pianoControlliPdf(d: DatiPianoControlli): ExportReportOptions {
  const applicati = d.stato.modelli.filter(m => m.applicato).map(m => m.nome);
  const impostazioni: PdfSection = {
    title: 'Impostazioni',
    head: ['Voce', 'Valore'],
    body: [
      ['Settori applicati', applicati.length ? applicati.join(', ') : 'nessuno (partito da zero)'],
      ['Per i controlli nuovi', `${frasePreavvisi(d.stato.predefiniti.preavvisi.giorni)} · ${fraseTolleranza(d.stato.predefiniti.tolleranza.giorni)}`],
      ...(d.regole ? [['Avvisi', maiuscola(fraseRegole(d.regole))]] : []),
    ],
  };
  const attivi = d.gruppi.reduce((n, g) => n + g.controlli.filter(c => c.attivo).length, 0);
  const summary: PdfSummaryItem[] = [
    { label: 'Controlli attivi', value: String(attivi), note: conteggio(d.gruppi.reduce((n, g) => n + g.categorie.length, 0), 'categoria', 'categorie') },
    ...d.gruppi
      .filter(g => g.controlli.some(c => c.attivo))
      .map(g => ({ label: TIPI[g.tipo].plurale, value: String(g.controlli.filter(c => c.attivo).length), note: conteggio(g.categorie.length, 'categoria', 'categorie') })),
  ];
  return {
    filename: `piano-dei-controlli-${d.oggi}`,
    title: 'Piano dei controlli',
    subtitle: `Le scadenze che Vigilo segue per l'azienda · situazione ${giornoCon('a', d.oggi)}`,
    summary,
    sections: [impostazioni, ...d.gruppi.map(sezioneTipo), sezioneDisattivati(d.gruppi)].filter((x): x is PdfSection => x !== null),
    orientation: 'landscape',
  };
}
