// src/core/assistenza/components/TabellaAccessi.tsx
//
// Gli accessi in tabella, da 1280 px in su: quando, chi, modalità,
// motivo, durata e stato. Sui telefoni ci sono le schede (SchedeAccessi).
import React from 'react';
import { Table, type TableColumn } from '@edg/ui';

import type { AccessoAssistenza } from '../types';
import { durataAccesso, quandoAccesso } from '../utils';
import { ModalitaAccesso } from './ModalitaAccesso';
import { StatoAccesso } from './StatoAccesso';

const colonne: TableColumn<AccessoAssistenza>[] = [
  { header: 'Quando', accessor: a => <span className='whitespace-nowrap'>{quandoAccesso(a.inizio)}</span> },
  {
    header: 'Chi',
    accessor: a => (
      <div>
        <div className='text-text-primary'>{a.operatore}</div>
        <div className='text-xs text-text-secondary'>Assistenza EDG</div>
      </div>
    ),
  },
  { header: 'Modalità', accessor: a => <ModalitaAccesso a={a} /> },
  {
    header: 'Motivo',
    accessor: a => (
      <span className='line-clamp-2 max-w-80' title={a.motivo}>
        {a.motivo}
      </span>
    ),
  },
  { header: 'Durata', accessor: a => <span className='whitespace-nowrap'>{durataAccesso(a)}</span> },
  { header: 'Stato', accessor: a => <StatoAccesso stato={a.stato} /> },
];

export const TabellaAccessi: React.FC<{ accessi: AccessoAssistenza[]; caricamento: boolean }> = ({ accessi, caricamento }) => (
  <Table
    data={accessi}
    columns={colonne}
    keyExtractor={a => a.uuid}
    isLoading={caricamento && accessi.length === 0}
    emptyMessage="Nessun accesso dell'assistenza EDG finora."
    striped
  />
);
