// src/features/vigilo/utils/pdfSpese.ts
//
// Il PDF del resoconto Spese e consumi (exportReportToPdf di @edg/ui): in
// testa periodo e filtri, i quattro numeri dei riquadri, poi mese per mese,
// per soggetto, per natura (con i rifornimenti voce per voce), a chi vanno (per fornitore e per tipo) e, se
// letto, il costo stimato dei mezzi. Tutte le righe, non solo quelle in
// vista. Le cifre come a schermo.
import { exportReportToPdf, type PdfSection, type PdfSummaryItem } from '@edg/ui';

import { NATURE_RESOCONTO } from '../constants/resoconti';
import { NOMI_VOCI, VOCI_CON_LITRI } from '../constants/rifornimenti';
import { TIPI } from '../constants/tipiSoggetto';
import type { CostoMezzi } from '../types/costoMezzi';
import type { Spese } from '../types/resoconti';
import { confrontoTesto, costoPerUnitaTesto, gruppoDi, guastiTesto, rifornimentiTesto } from './costoMezzi';
import type { TipoSoggetto } from '../types/valori';
import { testoOre } from './manodopera';
import { maiuscola } from './testo';
import { costoUnita, euroTondi, litri, periodoTesto, uso, variazione, variazioneTesto } from './resoconti';

const MESI_LUNGHI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

/** "Ottobre 2026" da "2026-10" */
const meseLungo = (m: string) => `${MESI_LUNGHI[Number(m.slice(5)) - 1]} ${m.slice(0, 4)}`;

/** "+12% rispetto all'anno prima" / "come l'anno prima" / "nessuna spesa l'anno prima" */
function confronto(ora: number, prima: number): string {
  const v = variazione(ora, prima);
  if (v === null) return "nessuna spesa l'anno prima";
  return v === 0 ? "come l'anno prima" : `${variazioneTesto(v)} rispetto all'anno prima`;
}

const conteggio = (n: number, uno: string, molti: string) => `${n} ${n === 1 ? uno : molti}`;


/** I filtri attivi in parole, per il sottotitolo */
export interface FiltriInParole {
  tipo?: TipoSoggetto;
  sede?: string;
  testo?: string;
}

function riepilogo(d: Spese): PdfSummaryItem[] {
  const t = d.totale;
  return [
    { label: 'Totale speso', value: euroTondi(t.spesa), note: confronto(t.spesa, d.totalePrima.spesa) },
    { label: 'Fornitori esterni', value: euroTondi(t.importi), note: `${conteggio(t.conImporto, 'spesa', 'spese')} con importo` },
    { label: 'Manodopera interna', value: euroTondi(t.manodopera), note: t.ore ? `${testoOre(t.ore)} di lavoro interno` : 'nessuna ora registrata' },
    { label: 'Riparazioni', value: euroTondi(d.riparazioni.spesa), note: `${conteggio(d.riparazioni.guasti, 'guasto', 'guasti')} · ${confronto(d.riparazioni.spesa, d.riparazioni.spesaPrima)}` },
  ];
}

function sezioni(d: Spese): PdfSection[] {
  const mesi = d.perMese;
  const somma = (f: (m: Spese['perMese'][number]) => number) => mesi.reduce((t, m) => t + f(m), 0);
  return [
    {
      title: 'Mese per mese',
      head: ['Mese', 'Fornitori', 'Manodopera', 'Totale', 'Anno prima'],
      body: mesi.map(m => [meseLungo(m.mese), euroTondi(m.importi), euroTondi(m.manodopera), euroTondi(m.importi + m.manodopera), euroTondi(m.prima)]),
      foot: ['Totale', euroTondi(somma(m => m.importi)), euroTondi(somma(m => m.manodopera)), euroTondi(somma(m => m.importi + m.manodopera)), euroTondi(somma(m => m.prima))],
      rightAligned: [1, 2, 3, 4],
    },
    {
      title: 'Per soggetto',
      head: ['Soggetto', 'Tipo', 'Registrazioni', 'Spesa', 'Anno prima', 'Uso nel periodo', 'Costo per km / ora'],
      body: d.perSoggetto.map(s => [
        s.identificativo ? `${s.nome} (${s.identificativo})` : s.nome,
        maiuscola(TIPI[s.tipo]?.singolare ?? s.tipo),
        String(s.n),
        euroTondi(s.spesa),
        s.variazione === null ? '—' : variazioneTesto(s.variazione),
        s.uso?.valore != null ? uso(s.uso.valore, s.uso.unita) : '—',
        s.costoPerUnita != null && s.uso ? costoUnita(s.costoPerUnita, s.uso.unita) : s.uso ? 'uso troppo basso' : '—',
      ]),
      rightAligned: [2, 3, 4, 5, 6],
      empty: 'Nessuna spesa sui soggetti nel periodo.',
    },
    {
      title: 'Per natura',
      head: ['Natura', 'Registrazioni', 'Spesa'],
      body: d.perNatura.map(n => [NATURE_RESOCONTO[n.natura] ?? n.natura, String(n.n), euroTondi(n.spesa)]),
      rightAligned: [1, 2],
      empty: 'Nessuna spesa nel periodo.',
    },
    ...(d.perVoce.length
      ? [
          {
            title: 'Rifornimenti e uso, voce per voce',
            head: ['Voce', 'Spese', 'Litri', 'Spesa'],
            body: d.perVoce.map(v => [NOMI_VOCI[v.voce], String(v.n), VOCI_CON_LITRI.includes(v.voce) && v.litri > 0 ? litri(v.litri) : '—', euroTondi(v.spesa)]),
            rightAligned: [1, 2, 3],
          },
        ]
      : []),
    {
      title: 'A chi vanno: per fornitore',
      head: ['Fornitore', 'Tipo', 'Registrazioni', 'Importi'],
      body: d.perFornitore.map(f => [f.nome, f.tipo?.nome ?? '—', String(f.n), euroTondi(f.importi)]),
      rightAligned: [2, 3],
      empty: 'Nessun importo di fornitori nel periodo.',
    },
    {
      title: 'A chi vanno: per tipo di fornitore',
      head: ['Tipo di fornitore', 'Registrazioni', 'Importi'],
      body: d.perTipoFornitore.map(t => [t.nome, String(t.n), euroTondi(t.importi)]),
      rightAligned: [1, 2],
      empty: 'Nessun importo di fornitori nel periodo.',
    },
  ];
}

/** Il costo stimato dei mezzi, se letto */
function sezioneMezzi(m: CostoMezzi): PdfSection {
  return {
    title: 'Costo dei mezzi (stima: quote di possesso, obblighi, manutenzione, guasti, rifornimenti e uso)',
    head: ['Mezzo', 'Possesso', 'Manutenzione e guasti', 'Rifornimenti e uso', 'Totale', 'Costo per km / ora / mese', 'Rispetto alla categoria'],
    body: m.mezzi.map(c => [
      [c.nome, c.identificativo, gruppoDi(c)].filter(Boolean).join(' · '),
      `${euroTondi(c.possesso.totale)}${c.parziale ? ' (parziale)' : ''}`,
      `${euroTondi(c.manutenzione.totale)} · ${guastiTesto(c.manutenzione.guasti)}`,
      `${euroTondi(c.rifornimenti.totale)} · ${rifornimentiTesto(c)}`,
      euroTondi(c.totale),
      costoPerUnitaTesto(c) ?? '—',
      confrontoTesto(c, m.sogliaScostamento, false),
    ]),
    rightAligned: [1, 4, 5],
    empty: 'Nessun mezzo con costi nel periodo.',
  };
}

/** Scarica il PDF del resoconto mostrato (con il costo dei mezzi, se letto) */
export function esportaPdfSpese(d: Spese, filtri: FiltriInParole, mezzi?: CostoMezzi | null): void {
  const quali = [
    filtri.tipo ? TIPI[filtri.tipo].plurale : null,
    filtri.sede ? `sede ${filtri.sede}` : null,
    filtri.testo ? `ricerca «${filtri.testo}»` : null,
  ].filter(Boolean);
  exportReportToPdf({
    filename: `spese-vigilo-${d.periodo.dal}-${d.periodo.al}`,
    title: 'Spese e consumi',
    subtitle: `${periodoTesto(d.periodo)} · confronto con ${periodoTesto(d.confronto)}${quali.length ? ` · ${quali.join(', ')}` : ''}`,
    summary: riepilogo(d),
    sections: mezzi ? [...sezioni(d), sezioneMezzi(mezzi)] : sezioni(d),
  });
}
