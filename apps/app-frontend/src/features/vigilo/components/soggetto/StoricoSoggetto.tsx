// src/features/vigilo/components/soggetto/StoricoSoggetto.tsx
//
// Tutto ciò che è stato registrato sulle scadenze del soggetto, dal più
// recente: quando, quale scadenza, che cosa, con quali dettagli.
import React from 'react';
import { Alert, Button, Table } from '@edg/ui';

import { useStorico } from '../../hooks/useStorico';
import { giornoBreve } from '../../utils/giorni';
import { dettagliRegistrazione, descrizioneRegistrazione } from '../../utils/registrazioni';

export const StoricoSoggetto: React.FC<{ soggetto: string }> = ({ soggetto }) => {
  const st = useStorico(soggetto);
  return (
    <div className='space-y-4'>
      {st.errore && (
        <Alert variant='danger' title='Impossibile leggere lo storico'>
          {st.errore}
        </Alert>
      )}
      <Table
        data={st.righe}
        keyExtractor={r => r.uuid}
        isLoading={st.caricamento && st.righe.length === 0}
        emptyMessage='Nessuna registrazione finora.'
        striped
        columns={[
          { header: 'Data', accessor: r => <span className='whitespace-nowrap'>{giornoBreve(r.eseguitaIl)}</span>, className: 'w-32' },
          { header: 'Scadenza', accessor: r => <span className='font-medium text-text-primary'>{r.scadenza?.titolo ?? '—'}</span> },
          {
            header: 'Che cosa',
            accessor: r => <span className={r.esito === 'negativo' ? 'font-semibold text-orange-700 [.dark_&]:text-orange-400' : undefined}>{descrizioneRegistrazione(r)}</span>,
          },
          { header: 'Dettagli', accessor: r => <span className='text-text-secondary'>{dettagliRegistrazione(r) || '—'}</span> },
        ]}
      />
      {st.altre && (
        <div className='flex justify-center'>
          <Button variant='secondary' onClick={() => void st.mostraAltre()} isLoading={st.caricamento} loadingText='Carico…'>
            Mostra altre ({st.totale - st.righe.length})
          </Button>
        </div>
      )}
    </div>
  );
};
