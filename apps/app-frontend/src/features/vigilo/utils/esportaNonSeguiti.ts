// src/features/vigilo/utils/esportaNonSeguiti.ts
//
// Il report "Controlli non seguiti" di Configurazione (report, 2026-11-12):
// colonne del PDF e riga sotto il titolo. Con lo storico c'è anche la colonna
// Ripreso ("—" per le decisioni ancora in corso).
import type { PdfColumn } from '@edg/ui';

import type { DecisioneDelTenant, QualiDecisioni } from '../types/controlliSoggetto';
import { aGiorno, giornoBreve } from './giorni';

const giornoDi = (istante: string) => giornoBreve(aGiorno(new Date(istante)));
const chiQuando = (nome: string | null, istante: string) => [nome && `da ${nome}`, giornoDi(istante)].filter(Boolean).join(' · ');

/** "Iveco S-Way 02 (GH256KN)" */
const soggettoDi = (d: DecisioneDelTenant) => (d.soggetto.identificativo ? `${d.soggetto.nome} (${d.soggetto.identificativo})` : d.soggetto.nome);

/** "da Mario Rossi · 12 nov 2026: torna in uso", "—" se è ancora in corso */
const ripresaDi = (d: DecisioneDelTenant) =>
  d.ripresaIl ? `${chiQuando(d.ripresaDa, d.ripresaIl)}${d.notaRipresa ? `: ${d.notaRipresa}` : ''}` : '—';

export const colonneNonSeguiti = (quali: QualiDecisioni): PdfColumn<DecisioneDelTenant>[] => [
  { header: 'Soggetto', accessor: soggettoDi },
  { header: 'Controllo', accessor: d => d.controllo.nome },
  { header: 'Motivo', accessor: d => d.motivo },
  { header: 'Deciso', accessor: d => chiQuando(d.decisaDa, d.decisaIl) },
  ...(quali === 'tutte' ? [{ header: 'Ripreso', accessor: ripresaDi }] : []),
];

/** "in corso · 3 righe", "con lo storico · 5 righe" */
export const sottotitoloNonSeguiti = (quali: QualiDecisioni, righe: number) =>
  `${quali === 'in-corso' ? 'in corso' : 'con lo storico (anche le decisioni riprese)'} · ${righe} ${righe === 1 ? 'riga' : 'righe'}`;
