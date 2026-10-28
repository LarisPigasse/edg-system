// src/features/vigilo/components/scadenze/TabellaScadenze.tsx
//
// La tabella delle scadenze: scadenza, soggetto (link alla sua scheda),
// natura, stato nel colore della dashboard (per le chiuse: quando e
// perché), data o soglia. Un clic sulla riga apre il pannello con le azioni.
// Accanto allo stato, la segnalazione dell'addetto da confermare (B9c).
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Table, type TableColumn } from '@edg/ui';

import type { StatoElencoScadenze } from '../../hooks/useElencoScadenze';
import type { Scadenza } from '../../types/scadenze';
import { chiusuraDi, naturaDi, quandoDi } from '../../utils/descrizioneScadenza';
import { StatoScadenza } from '../StatoScadenza';

function colonne(chiuse: boolean): TableColumn<Scadenza>[] {
  return [
    { header: 'Scadenza', accessor: s => <span className='font-medium text-text-primary'>{s.titolo}</span> },
    {
      header: 'Soggetto',
      accessor: s =>
        s.soggetto ? (
          <Link to={`/vigilo/soggetti/${s.soggetto.uuid}`} onClick={ev => ev.stopPropagation()} className='text-text-link hover:underline'>
            {s.soggetto.nome}
            {s.soggetto.identificativo && <span className='ml-2 font-mono text-xs text-text-secondary'>{s.soggetto.identificativo}</span>}
          </Link>
        ) : (
          <span className='text-text-secondary'>Promemoria</span>
        ),
    },
    { header: 'Natura', accessor: s => naturaDi(s) },
    chiuse
      ? { header: 'Chiusa', accessor: s => <span className='text-text-secondary'>{chiusuraDi(s)}</span> }
      : {
          header: 'Stato',
          accessor: s => (
            <span className='inline-flex flex-wrap items-center gap-2'>
              <StatoScadenza stato={s.stato} testo={s.testo} />
              {s.segnalata && <Badge variant='info' size='xs' text='Da confermare' className='rounded-lg' />}
            </span>
          ),
        },
    { header: 'Data o soglia', accessor: s => <span className='whitespace-nowrap'>{quandoDi(s)}</span> },
  ];
}

interface Props {
  e: StatoElencoScadenze;
  onApri: (s: Scadenza) => void;
}

export const TabellaScadenze: React.FC<Props> = ({ e, onApri }) => (
  <div className='space-y-4'>
    <Table
      data={e.righe}
      columns={colonne(e.filtri.stato === 'chiuse')}
      keyExtractor={s => s.uuid}
      isLoading={e.caricamento && e.righe.length === 0}
      emptyMessage={e.filtriAttivi ? 'Nessuna scadenza con questi filtri.' : 'Nessuna scadenza aperta.'}
      striped
      hoverable
      onRowClick={onApri}
    />
    {e.altre && (
      <div className='flex justify-center'>
        <Button variant='secondary' onClick={() => void e.mostraAltre()} isLoading={e.caricamento} loadingText='Carico…'>
          Mostra altre ({e.totale - e.righe.length})
        </Button>
      </div>
    )}
  </div>
);
