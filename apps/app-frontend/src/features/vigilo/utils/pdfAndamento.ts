// src/features/vigilo/utils/pdfAndamento.ts
//
// Il PDF dell'andamento dei costi di un mezzo (2026-11-17): in testa il mezzo,
// il periodo e il tipo di grafico; le cifre delle tre voci e del totale; il
// grafico com'è a video (immagine) con la legenda; la tabella mese per mese
// (quote, obblighi, possesso, manutenzione, rifornimenti, totale) con i
// totali; la nota sugli obblighi e, se c'è, sul mese in corso. Regole pure:
// l'immagine e i colori li prepara la finestra.
import type { ExportReportOptions, ImmagineSvg } from '@edg/ui';

import { GRAFICI_ANDAMENTO, NOMI_BLOCCHI, type BloccoAndamento } from '../constants/costoMezzi';
import type { VistaAndamento } from '../hooks/useAndamentoCosti';
import type { AndamentoCosti, TipoGraficoAndamento } from '../types/costoMezzi';
import { euroBrevi, meseCorto, periodoTesto } from './resoconti';
import { nomeFileDi } from './testo';

export interface DatiPdfAndamento {
  nome: string;
  dati: AndamentoCosti;
  grafico: TipoGraficoAndamento;
  vista: VistaAndamento;
  immagine: ImmagineSvg | null;
  /** I colori delle tre voci, già risolti (niente variabili CSS) */
  colori: Record<BloccoAndamento, string>;
  oggi: string;
}

const BLOCCHI: BloccoAndamento[] = ['possesso', 'manutenzione', 'uso'];

/** La nota in fondo: come si contano gli obblighi e il mese in corso */
export function notaAndamento(d: AndamentoCosti): string {
  const obblighi = d.obblighiRipartiti
    ? 'Gli obblighi (bollo, assicurazione, revisione) sono nel possesso ripartiti sui 12 mesi dal pagamento, perché valgono un anno.'
    : 'Stesso periodo e stesse cifre della scheda dei costi: gli obblighi (bollo, assicurazione, revisione) contano per intero nel mese in cui si pagano.';
  const inCorso = d.meseInCorso ? ` * ${meseCorto(d.meseInCorso, true)} è il mese in corso: i suoi dati arrivano fino a oggi.` : '';
  return `Stima dalle spese registrate. ${obblighi}${inCorso}`;
}

/** Le opzioni del PDF (pura) */
export function andamentoPdf(p: DatiPdfAndamento): ExportReportOptions {
  const d = p.dati;
  const mesi = Math.max(d.mesi.length, 1);
  const tipo = GRAFICI_ANDAMENTO.find(g => g.value === p.grafico)?.label ?? '';
  const comeVista = p.grafico === 'linee' ? (p.vista === 'cumulato' ? ', cumulato' : ', mese per mese') : '';
  return {
    filename: `andamento-costi-${nomeFileDi(p.nome)}-${p.oggi}`,
    title: `Andamento dei costi · ${p.nome}`,
    subtitle: `${periodoTesto(d.periodo)} · ${tipo}${comeVista}`,
    summary: [
      ...BLOCCHI.map(b => ({ label: NOMI_BLOCCHI[b], value: euroBrevi(d.totali[b]), note: `${d.quote[b]}% del totale` })),
      { label: 'Totale', value: euroBrevi(d.totali.totale), note: `${euroBrevi(d.totali.totale / mesi)} al mese, in media` },
    ],
    image: p.immagine ? { ...p.immagine, legend: BLOCCHI.map(b => ({ label: NOMI_BLOCCHI[b], color: p.colori[b] })) } : undefined,
    sections: [
      {
        title: 'Mese per mese',
        head: ['Mese', 'Quote', d.obblighiRipartiti ? 'Obblighi (ripartiti)' : 'Obblighi', 'Possesso', 'Manutenzione e guasti', 'Rifornimenti e uso', 'Totale'],
        body: d.mesi.map(m => [
          `${meseCorto(m.mese, true)}${m.mese === d.meseInCorso ? ' *' : ''}`,
          euroBrevi(m.quota),
          euroBrevi(m.obblighi),
          euroBrevi(m.possesso),
          euroBrevi(m.manutenzione),
          euroBrevi(m.uso),
          euroBrevi(m.totale),
        ]),
        foot: ['Totale', euroBrevi(d.totali.quota), euroBrevi(d.totali.obblighi), euroBrevi(d.totali.possesso), euroBrevi(d.totali.manutenzione), euroBrevi(d.totali.uso), euroBrevi(d.totali.totale)],
        rightAligned: [1, 2, 3, 4, 5, 6],
      },
    ],
    footnote: notaAndamento(d),
    orientation: 'landscape',
  };
}
