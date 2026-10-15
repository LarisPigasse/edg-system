// src/features/vigilo/components/soggetti/SchedeTipo.tsx
//
// Le schede per tipo, con il conteggio: "Tutti" e poi solo i tipi usati.
// I numeri contano i soggetti attivi e sospesi (come la dashboard).
import React from 'react';
import { LayoutGrid, Tabs, type TabItem } from '@edg/ui';

import { TIPI } from '../../constants/tipiSoggetto';
import type { Dashboard } from '../../types/dashboard';
import { TIPI_SOGGETTO, type TipoSoggetto } from '../../types/valori';

const TUTTI = 'tutti';

const Etichetta: React.FC<{ testo: string; n: number }> = ({ testo, n }) => (
  <span className='inline-flex items-center gap-2'>
    {testo}
    <span className='rounded-full bg-bg-secondary px-2 py-0.5 text-xs font-semibold tabular-nums text-text-secondary'>{n}</span>
  </span>
);

interface Props {
  conteggi: Dashboard['soggetti'];
  tipo: TipoSoggetto | null;
  onTipo: (t: TipoSoggetto | null) => void;
}

export const SchedeTipo: React.FC<Props> = ({ conteggi, tipo, onTipo }) => {
  const n = new Map(conteggi.map(c => [c.tipo, c.n]));
  // i tipi usati, più quello scelto (se arriva da un link e non ne ha)
  const usati = TIPI_SOGGETTO.filter(t => (n.get(t) ?? 0) > 0 || t === tipo);
  const schede: TabItem[] = [
    { id: TUTTI, icon: LayoutGrid, label: <Etichetta testo='Tutti' n={conteggi.reduce((s, c) => s + c.n, 0)} />, content: null },
    ...usati.map(t => ({ id: t, icon: TIPI[t].icona, label: <Etichetta testo={TIPI[t].plurale} n={n.get(t) ?? 0} />, content: null })),
  ];
  return <Tabs items={schede} defaultTab={tipo ?? TUTTI} onTabChange={id => onTipo(id === TUTTI ? null : (id as TipoSoggetto))} />;
};
