// src/features/vigilo/components/soggetti/TabellaSoggetti.tsx
//
// La tabella dei soggetti: nome, identificativo (con il nome giusto per il
// tipo: targa, matricola…), categoria, sede, stato (attivo, sospeso,
// archiviato: il significato nel tooltip) e situazione delle
// scadenze. Senza un tipo scelto c'è anche la colonna del tipo.
import React from 'react';
import { Button, Table, Tooltip, type TableColumn } from '@edg/ui';

import { STATI_SOGGETTO, etichettaStato } from '../../constants/statiSoggetto';
import { TIPI } from '../../constants/tipiSoggetto';
import type { StatoSoggetti } from '../../hooks/useSoggetti';
import type { Soggetto } from '../../types/soggetti';
import { giornoBreve } from '../../utils/giorni';
import { maiuscola } from '../../utils/testo';
import { SituazioneSoggetto } from './SituazioneSoggetto';

function colonne(s: StatoSoggetti): TableColumn<Soggetto>[] {
  const t = s.tipo;
  return [
    {
      header: 'Nome',
      accessor: x => (
        <span className='flex min-w-0 items-center gap-2'>
          {!t && React.createElement(TIPI[x.tipo].icona, { className: 'h-4 w-4 shrink-0 text-text-secondary', 'aria-label': maiuscola(TIPI[x.tipo].singolare) })}
          <span className='truncate font-medium text-text-primary'>{x.nome}</span>
        </span>
      ),
    },
    { header: t ? TIPI[t].identificativo : 'Identificativo', accessor: x => <span className='font-mono text-sm'>{x.identificativo ?? '—'}</span> },
    { header: 'Categoria', accessor: x => x.categoria?.nome ?? '—' },
    ...(t === 'sede' || t === 'azienda' ? [] : [{ header: 'Sede', accessor: (x: Soggetto) => x.sede?.nome ?? '—' }]),
    {
      header: 'Stato',
      accessor: x => (
        <Tooltip content={STATI_SOGGETTO[x.stato].info}>
          <span className={STATI_SOGGETTO[x.stato].testo}>
            {etichettaStato(x.stato, x.tipo)}
            {x.stato !== 'in-servizio' && x.statoDal ? ` dal ${giornoBreve(x.statoDal)}` : ''}
          </span>
        </Tooltip>
      ),
    },
    { header: 'Situazione', accessor: x => <SituazioneSoggetto scadenze={x.scadenze} /> },
  ];
}

interface Props {
  s: StatoSoggetti;
  onApri?: (x: Soggetto) => void;
}

export const TabellaSoggetti: React.FC<Props> = ({ s, onApri }) => (
  <div className='space-y-4'>
    <Table
      data={s.righe}
      columns={colonne(s)}
      keyExtractor={x => x.uuid}
      isLoading={s.caricamento && s.righe.length === 0}
      emptyMessage={s.filtriAttivi ? 'Nessun soggetto con questi filtri.' : 'Nessun soggetto inserito.'}
      striped
      hoverable
      onRowClick={onApri}
    />
    {s.altre && (
      <div className='flex justify-center'>
        <Button variant='secondary' onClick={s.mostraAltri} isLoading={s.caricamento} loadingText='Carico…'>
          Mostra altri ({s.totale - s.righe.length})
        </Button>
      </div>
    )}
  </div>
);
