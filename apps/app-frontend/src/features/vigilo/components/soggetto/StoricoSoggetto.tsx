// src/features/vigilo/components/soggetto/StoricoSoggetto.tsx
//
// Tutto ciò che è stato registrato sulle scadenze del soggetto, dal più
// recente: quando, quale scadenza, che cosa, con quali dettagli. Sopra,
// Esporta (report, 2026-11-12): tutto lo storico in PDF o CSV.
import React from 'react';
import { Alert, Button, Table } from '@edg/ui';

import { leggiTuttoStorico } from '../../api/soggetti';
import { nomeFileDi, useEsportazione } from '../../hooks/useEsportazione';
import { useStorico } from '../../hooks/useStorico';
import { colonneCsvStorico, colonnePdfStorico } from '../../utils/esportaStorico';
import { MenuEsporta } from '../MenuEsporta';
import { giornoBreve } from '../../utils/giorni';
import { dettagliRegistrazione, descrizioneRegistrazione } from '../../utils/registrazioni';

interface Props {
  soggetto: string;
  /** Per il titolo e il nome del file */
  nome: string;
  /** vigilo.costi: importi nel CSV */
  conCosti: boolean;
}

export const StoricoSoggetto: React.FC<Props> = ({ soggetto, nome, conCosti }) => {
  const st = useStorico(soggetto);
  const esporta = useEsportazione({
    leggi: () => leggiTuttoStorico(soggetto),
    nomeFile: `storico-${nomeFileDi(nome)}`,
    titolo: `Storico · ${nome}`,
    sottotitolo: n => `${n} ${n === 1 ? 'registrazione' : 'registrazioni'}, dalla più recente`,
    colonnePdf: colonnePdfStorico,
    colonneCsv: colonneCsvStorico(conCosti),
    vuoto: 'Nessuna registrazione finora.',
  });
  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <MenuEsporta
          size='sm'
          onPdf={() => void esporta.esporta('pdf')}
          onCsv={() => void esporta.esporta('csv')}
          inCorso={esporta.inCorso}
          disabilitato={st.righe.length === 0}
        />
      </div>
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
