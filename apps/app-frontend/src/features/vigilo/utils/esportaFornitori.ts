// src/features/vigilo/utils/esportaFornitori.ts
//
// La rubrica dei fornitori in PDF e CSV (report, 2026-11-12): l'elenco come
// si vede (stato, tipo, ricerca, ordinamento). Nel CSV in più indirizzo,
// note e stato, con gli interventi come numero.
import { csvDate, type CsvColumn, type PdfColumn } from '@edg/ui';

import { FILTRI_STATO_FORNITORI } from '../constants/fornitori';
import type { FiltriFornitori, Fornitore, OrdinaFornitori, TipoFornitore } from '../types/fornitori';
import { giornoBreve } from './giorni';

export const colonnePdfFornitori: PdfColumn<Fornitore>[] = [
  { header: 'Nome', accessor: f => f.nome },
  { header: 'Tipo', accessor: f => f.tipo?.nome ?? '—' },
  { header: 'Telefono', accessor: f => f.telefono ?? '—' },
  { header: 'Email', accessor: f => f.email ?? '—' },
  { header: 'Referente', accessor: f => f.referente ?? '—' },
  { header: 'Interventi', accessor: f => String(f.registrazioni ?? 0), align: 'right' },
  { header: 'Ultimo intervento', accessor: f => (f.ultimaIl ? giornoBreve(f.ultimaIl.slice(0, 10)) : '—') },
];

export const colonneCsvFornitori: CsvColumn<Fornitore>[] = [
  { header: 'Nome', accessor: f => f.nome },
  { header: 'Tipo', accessor: f => f.tipo?.nome },
  { header: 'Telefono', accessor: f => f.telefono },
  { header: 'Email', accessor: f => f.email },
  { header: 'Referente', accessor: f => f.referente },
  { header: 'Indirizzo', accessor: f => f.indirizzo },
  { header: 'Interventi', accessor: f => f.registrazioni ?? 0 },
  { header: 'Ultimo intervento', accessor: f => csvDate(f.ultimaIl?.slice(0, 10)) },
  { header: 'Stato', accessor: f => (f.attivo ? 'Attivo' : 'Disattivato') },
  { header: 'Note', accessor: f => f.note },
];

/** "Attivi · Officine · "rossi" · per nome · 12 righe" */
export const filtriFornitori = (p: { filtri: FiltriFornitori; testo?: string; ordina: OrdinaFornitori; tipi: TipoFornitore[]; righe: number }) =>
  [
    FILTRI_STATO_FORNITORI.find(s => s.value === p.filtri.stato)?.label,
    p.filtri.tipo && p.tipi.find(t => t.chiave === p.filtri.tipo)?.nome,
    p.testo && `"${p.testo}"`,
    p.ordina === 'nome' ? 'per nome' : 'per tipo',
    `${p.righe} ${p.righe === 1 ? 'riga' : 'righe'}`,
  ]
    .filter(Boolean)
    .join(' · ');
