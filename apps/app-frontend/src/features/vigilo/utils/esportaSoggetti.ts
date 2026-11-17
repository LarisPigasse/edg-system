// src/features/vigilo/utils/esportaSoggetti.ts
//
// Il report dei soggetti (report, 2026-11-12): le colonne del PDF e del CSV
// e la riga dei filtri sotto il titolo. Regole pure: le righe le legge
// useEsportaSoggetti. Il PDF ha le colonne della tabella; il CSV in più il
// codice interno, le date in gg/mm/aaaa e, con un tipo scelto, i suoi dati
// (per i veicoli marca, modello, immatricolazione…).
import { csvDate, type CsvColumn, type PdfColumn } from '@edg/ui';

import { DATI_TIPO } from '../constants/datiTipo';
import { STATI_ASPETTO } from '../constants/stati';
import { FILTRI_STATO, etichettaStato } from '../constants/statiSoggetto';
import { TIPI } from '../constants/tipiSoggetto';
import type { Categoria } from '../types/configurazione';
import type { RiferimentoSoggetto } from '../types/scadenze';
import type { FiltriSoggetti, OrdinaSoggetti, Soggetto } from '../types/soggetti';
import type { TipoSoggetto } from '../types/valori';
import { testoDato } from './dati';
import { giornoBreve, giornoCon } from './giorni';
import { maiuscola } from './testo';

const conSede = (tipo: TipoSoggetto | null) => tipo !== 'sede' && tipo !== 'azienda';
const identificativo = (tipo: TipoSoggetto | null) => (tipo ? TIPI[tipo].identificativo : 'Identificativo');
/** "Veicolo", "Attrezzatura" */
const tipoDi = (s: Soggetto) => maiuscola(TIPI[s.tipo].singolare);

/** "Sospeso dall'11 nov 2026", "Attivo" */
export const statoDi = (s: Soggetto): string =>
  `${etichettaStato(s.stato, s.tipo)}${s.stato !== 'in-servizio' && s.statoDal ? ` ${giornoCon('da', s.statoDal.slice(0, 10))}` : ''}`;

/** "Scaduta · 5 nov 2026", "Nessuna scadenza aperta" */
export function situazioneDi(s: Soggetto): string {
  const x = s.scadenze;
  if (!x || !x.aperte) return 'Nessuna scadenza aperta';
  const stato = STATI_ASPETTO[x.statoPeggiore ?? 'in-regola'].etichetta;
  return x.urgenzaIl ? `${stato} · ${giornoBreve(x.urgenzaIl)}` : stato;
}

/** Le colonne del PDF: quelle della tabella, come testo */
export const colonnePdfSoggetti = (tipo: TipoSoggetto | null): PdfColumn<Soggetto>[] => [
  { header: 'Nome', accessor: s => s.nome },
  ...(tipo ? [] : [{ header: 'Tipo', accessor: tipoDi }]),
  { header: identificativo(tipo), accessor: s => s.identificativo ?? '—' },
  { header: 'Categoria', accessor: s => s.categoria?.nome ?? '—' },
  ...(conSede(tipo) ? [{ header: 'Sede', accessor: (s: Soggetto) => s.sede?.nome ?? '—' }] : []),
  { header: 'Stato', accessor: statoDi },
  { header: 'Scadenze aperte', accessor: s => String(s.scadenze?.aperte ?? 0), align: 'right' },
  { header: 'Situazione', accessor: situazioneDi },
];

/** Le colonne del CSV: in più codice, date separate e, con un tipo scelto, i suoi dati */
export const colonneCsvSoggetti = (tipo: TipoSoggetto | null): CsvColumn<Soggetto>[] => [
  { header: 'Nome', accessor: s => s.nome },
  { header: 'Tipo', accessor: tipoDi },
  { header: identificativo(tipo), accessor: s => s.identificativo },
  { header: 'Codice interno', accessor: s => s.codice },
  { header: 'Categoria', accessor: s => s.categoria?.nome },
  ...(conSede(tipo) ? [{ header: 'Sede', accessor: (s: Soggetto) => s.sede?.nome }] : []),
  { header: 'Stato', accessor: s => etichettaStato(s.stato, s.tipo) },
  { header: 'Stato dal', accessor: s => (s.stato !== 'in-servizio' ? csvDate(s.statoDal) : '') },
  { header: 'Scadenze aperte', accessor: s => s.scadenze?.aperte ?? 0 },
  { header: 'Stato peggiore', accessor: s => (s.scadenze?.aperte ? STATI_ASPETTO[s.scadenze.statoPeggiore ?? 'in-regola'].etichetta : '') },
  { header: 'Data della più urgente', accessor: s => csvDate(s.scadenze?.urgenzaIl) },
  ...(tipo
    ? DATI_TIPO[tipo].map(d => ({
        header: d.etichetta,
        accessor: (s: Soggetto) => (d.formato === 'data' ? csvDate(s.dati[d.chiave] as string | null) : testoDato(s.dati[d.chiave], d.formato)),
      }))
    : []),
];

/** Sotto il titolo: "Veicoli · Autocarri · Sede di Nereto · Attivi e sospesi · "furgone" · per urgenza · 9 righe" */
export function filtriSoggetti(p: {
  tipo: TipoSoggetto | null;
  filtri: FiltriSoggetti;
  testo: string;
  ordina: OrdinaSoggetti;
  categorie: Categoria[];
  sedi: RiferimentoSoggetto[];
  righe: number;
}): string {
  return [
    p.tipo ? TIPI[p.tipo].plurale : 'Tutti i tipi',
    p.filtri.categoria && p.categorie.find(c => c.uuid === p.filtri.categoria)?.nome,
    p.filtri.sede && p.sedi.find(s => s.uuid === p.filtri.sede)?.nome,
    FILTRI_STATO.find(f => f.value === p.filtri.stato)?.label,
    p.testo && `"${p.testo}"`,
    p.ordina === 'urgenza' ? 'per urgenza' : 'per nome',
    `${p.righe} ${p.righe === 1 ? 'riga' : 'righe'}`,
  ]
    .filter(Boolean)
    .join(' · ');
}
