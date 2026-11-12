// src/features/vigilo/utils/pdfSoggetto.ts
//
// La scheda di un soggetto in PDF (report, 2026-11-12), con exportReportToPdf
// di @edg/ui. In testa tipo e nome, identificativo, categoria, sede e data;
// i numeri in breve (stato, scadenze aperte, situazione e, con i costi, il
// costo dei 12 mesi); poi le sezioni Dati, Scadenze aperte, Controlli (quali
// si seguono, e il motivo di quelli non seguiti), Assegnazioni, Ultime
// registrazioni e, con i costi, Costo negli ultimi 12 mesi. Regole pure: i
// dati li legge useEsportaSchedaSoggetto.
import type { ExportReportOptions, PdfSection, PdfSummaryItem } from '@edg/ui';

import { DATI_TIPO } from '../constants/datiTipo';
import { NATURE_TESTO } from '../constants/nature';
import { TIPI } from '../constants/tipiSoggetto';
import type { CampoAggiuntivo } from '../types/configurazione';
import type { ControlliSoggetto } from '../types/controlliSoggetto';
import type { CostoMezzo } from '../types/costoMezzi';
import type { Scadenza } from '../types/scadenze';
import type { Assegnazione, RegistrazioneStorico, Soggetto } from '../types/soggetti';
import { confrontoTesto, costoPerUnitaTesto, guastiTesto, rifornimentiTesto } from './costoMezzi';
import { testoDato } from './dati';
import { naturaDi, quandoDi } from './descrizioneScadenza';
import { situazioneDi, statoDi } from './esportaSoggetti';
import { aGiorno, giornoBreve, giornoCon, giornoEsteso } from './giorni';
import { descrizioneRegistrazione, dettagliRegistrazione } from './registrazioni';
import { euroBrevi, uso } from './resoconti';
import { maiuscola } from './testo';

export interface DatiSchedaSoggetto {
  s: Soggetto;
  campi: CampoAggiuntivo[];
  /** Le scadenze aperte, per urgenza (quelle della scheda) */
  scadenze: Scadenza[];
  controlli: ControlliSoggetto | null;
  /** Le registrazioni più recenti (fino a REGISTRAZIONI_SCHEDA) */
  registrazioni: RegistrazioneStorico[];
  /** Quante registrazioni ha in tutto (per dire "le ultime N di M") */
  registrazioniTotali: number;
  /** null se il tipo non ha assegnazioni */
  assegnazioni: Assegnazione[] | null;
  /** Solo con vigilo.costi e per i mezzi; null se non c'è */
  costo: { mezzo: CostoMezzo; soglia: number } | null;
  oggi: string;
}

/** Quante registrazioni entrano nella scheda (le più recenti) */
export const REGISTRAZIONI_SCHEDA = 32;

const giornoDi = (istante: string) => giornoBreve(aGiorno(new Date(istante)));
const valore = (v: string | null | undefined) => (v === null || v === undefined || v === '' ? '—' : v);

function sezioneDati({ s, campi }: DatiSchedaSoggetto): PdfSection {
  const righe: [string, string | null][] = [
    [s.etichettaIdentificativo, s.identificativo],
    ['Categoria', s.categoria?.nome ?? null],
    ...(s.tipo !== 'sede' && s.tipo !== 'azienda' ? [['Sede', s.sede?.nome ?? null] as [string, string | null]] : []),
    ['Stato', statoDi(s)],
    ...DATI_TIPO[s.tipo].map(d => [d.etichetta, testoDato(s.dati[d.chiave], d.formato)] as [string, string | null]),
    ...campi.map(c => [c.etichetta, testoDato(s.campi[c.chiave], c.tipo)] as [string, string | null]),
    ['Codice interno', s.codice],
    ['Note', s.note],
    ['Inserito il', giornoEsteso(s.creatoIl.slice(0, 10))],
  ];
  return { title: 'Dati', head: ['Dato', 'Valore'], body: righe.map(([e, v]) => [e, valore(v)]) };
}

const sezioneScadenze = ({ scadenze }: DatiSchedaSoggetto): PdfSection => ({
  title: 'Scadenze aperte',
  head: ['Scadenza', 'Natura', 'Stato', 'Data o soglia'],
  body: scadenze.map(x => [x.titolo, naturaDi(x), x.testo, quandoDi(x)]),
  empty: 'Nessuna scadenza aperta.',
});

/** Ogni controllo che vale per il soggetto: "Sì", oppure "No: motivo (da X · data)" */
const sezioneControlli = ({ controlli }: DatiSchedaSoggetto): PdfSection => ({
  title: 'Controlli',
  head: ['Controllo', 'Natura', 'Si segue'],
  body: (controlli?.controlli ?? []).map(c => [
    c.nome,
    NATURE_TESTO[c.natura],
    c.nonSeguito ? `No: ${c.nonSeguito.motivo} (${[c.nonSeguito.da && `da ${c.nonSeguito.da}`, giornoDi(c.nonSeguito.il)].filter(Boolean).join(' · ')})` : 'Sì',
  ]),
  empty: controlli ? 'Nessun controllo attivo riguarda questo soggetto.' : 'Controlli non letti.',
});

function sezioneAssegnazioni({ s, assegnazioni }: DatiSchedaSoggetto): PdfSection | null {
  if (!assegnazioni) return null;
  const persona = s.tipo === 'persona';
  return {
    title: persona ? 'Mezzi assegnati' : 'Assegnazioni',
    head: [persona ? 'Mezzo' : 'Persona', 'Dal', 'Al', 'Note'],
    body: assegnazioni.map(a => [
      (persona ? a.soggetto?.nome : a.persona?.nome) ?? '—',
      giornoBreve(a.dal),
      a.al ? giornoBreve(a.al) : 'in corso',
      valore(a.note),
    ]),
    empty: 'Nessuna assegnazione.',
  };
}

const sezioneRegistrazioni = ({ registrazioni, registrazioniTotali }: DatiSchedaSoggetto): PdfSection => ({
  title:
    registrazioniTotali > registrazioni.length
      ? `Ultime registrazioni (le ${registrazioni.length} più recenti di ${registrazioniTotali})`
      : 'Registrazioni',
  head: ['Data', 'Scadenza', 'Che cosa', 'Dettagli'],
  body: registrazioni.map(r => [giornoBreve(r.eseguitaIl), r.scadenza?.titolo ?? '—', descrizioneRegistrazione(r), dettagliRegistrazione(r) || '—']),
  empty: 'Nessuna registrazione finora.',
});

function sezioneCosto({ costo }: DatiSchedaSoggetto): PdfSection | null {
  if (!costo) return null;
  const c = costo.mezzo;
  return {
    title: 'Costo negli ultimi 12 mesi (stima)',
    head: ['Voce', 'Importo', 'Dettaglio'],
    body: [
      ['Possesso', euroBrevi(c.possesso.totale), c.parziale ? 'manca il costo di possesso' : `${euroBrevi(c.possesso.quota)} quote · ${euroBrevi(c.possesso.obblighi)} obblighi`],
      ['Manutenzione e guasti', euroBrevi(c.manutenzione.totale), guastiTesto(c.manutenzione.guasti)],
      ['Rifornimenti e uso', euroBrevi(c.rifornimenti.totale), rifornimentiTesto(c)],
      [c.base === 'mese' ? 'Costo al mese' : `Costo per ${c.base === 'km' ? 'km' : 'ora'}`, costoPerUnitaTesto(c) ?? '—', confrontoTesto(c, costo.soglia)],
    ],
    foot: [c.parziale ? 'Totale (parziale)' : 'Totale', euroBrevi(c.totale), c.uso?.valore != null ? uso(c.uso.valore, c.uso.unita) : ''],
    rightAligned: [1],
  };
}

/** Le opzioni del PDF della scheda (pura) */
export function schedaSoggettoPdf(d: DatiSchedaSoggetto): ExportReportOptions {
  const { s } = d;
  const summary: PdfSummaryItem[] = [
    { label: 'Stato', value: statoDi(s) },
    { label: 'Scadenze aperte', value: String(d.scadenze.length), note: situazioneDi(s) },
    ...(d.controlli
      ? [
          {
            label: 'Controlli',
            value: String(d.controlli.controlli.length),
            note: (n => (n ? `${n} non ${n === 1 ? 'seguito' : 'seguiti'}` : 'tutti seguiti'))(d.controlli.controlli.filter(c => !c.seguito).length),
          },
        ]
      : []),
    ...(d.costo ? [{ label: 'Costo 12 mesi (stima)', value: euroBrevi(d.costo.mezzo.totale), note: d.costo.mezzo.parziale ? 'parziale' : undefined }] : []),
  ];
  return {
    filename: `scheda-${s.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${d.oggi}`,
    title: `${maiuscola(TIPI[s.tipo].singolare)}: ${s.nome}`,
    subtitle: [
      s.identificativo && `${s.etichettaIdentificativo} ${s.identificativo}`,
      s.categoria?.nome,
      s.tipo !== 'sede' && s.tipo !== 'azienda' ? s.sede?.nome : null,
      `situazione ${giornoCon('a', d.oggi)}`,
    ]
      .filter(Boolean)
      .join(' · '),
    summary,
    sections: [sezioneDati(d), sezioneScadenze(d), sezioneControlli(d), sezioneAssegnazioni(d), sezioneRegistrazioni(d), sezioneCosto(d)].filter(
      (x): x is PdfSection => x !== null
    ),
  };
}
