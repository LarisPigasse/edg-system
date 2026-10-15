// src/features/vigilo/components/soggetto/AssegnazioniSoggetto.tsx
//
// Per un mezzo: chi lo usa e chi l'ha usato. Per una persona: quali mezzi
// usa e ha usato. Le assegnazioni in corso per prime.
import React from 'react';
import { Alert, Table } from '@edg/ui';

import { useAssegnazioni } from '../../hooks/useAssegnazioni';
import type { Assegnazione } from '../../types/soggetti';
import { giornoBreve } from '../../utils/giorni';

export const AssegnazioniSoggetto: React.FC<{ uuid: string; comePersona: boolean }> = ({ uuid, comePersona }) => {
  const a = useAssegnazioni(uuid, comePersona);
  const chi = (x: Assegnazione) => (comePersona ? x.soggetto : x.persona);
  const ordinate = [...a.righe].sort((x, y) => Number(!!x.al) - Number(!!y.al));
  return (
    <div className='space-y-4'>
      {a.errore && (
        <Alert variant='danger' title='Impossibile leggere le assegnazioni'>
          {a.errore}
        </Alert>
      )}
      <Table
        data={ordinate}
        keyExtractor={x => x.uuid}
        isLoading={a.caricamento}
        emptyMessage={comePersona ? 'Nessun mezzo assegnato.' : 'Non è assegnato a nessuno.'}
        striped
        columns={[
          {
            header: comePersona ? 'Mezzo' : 'Persona',
            accessor: x => (
              <span className='font-medium text-text-primary'>
                {chi(x)?.nome ?? '—'}
                {chi(x)?.identificativo && comePersona && <span className='ml-2 font-mono text-sm text-text-secondary'>{chi(x)?.identificativo}</span>}
              </span>
            ),
          },
          { header: 'Dal', accessor: x => giornoBreve(x.dal), className: 'w-40' },
          {
            header: 'Al',
            accessor: x => (x.al ? giornoBreve(x.al) : <span className='font-semibold text-text-primary'>in corso</span>),
            className: 'w-40',
          },
          { header: 'Note', accessor: x => <span className='text-text-secondary'>{x.note ?? '—'}</span> },
        ]}
      />
    </div>
  );
};
