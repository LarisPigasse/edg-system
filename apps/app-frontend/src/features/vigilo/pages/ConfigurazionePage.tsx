// src/features/vigilo/pages/ConfigurazionePage.tsx
//
// Configurazione di Vigilo (passo 7.8), prima versione in sola lettura:
// settori e predefiniti in breve, poi una scheda per tipo di soggetto con
// categorie e controlli. Da qui si riapre la libreria. Modifica, editor della
// cadenza e "Ricomincia da capo" arriveranno sulla stessa pagina.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, PageHeader, Skeleton, Tabs, type TabItem } from '@edg/ui';

import { TIPI } from '../constants/tipiSoggetto';
import { Impostazioni } from '../components/configurazione/Impostazioni';
import { SchedaTipo } from '../components/configurazione/SchedaTipo';
import { useConfigurazione } from '../hooks/useConfigurazione';

const ConfigurazionePage: React.FC = () => {
  const navigate = useNavigate();
  const { gruppi, stato, errore, caricamento, ricarica, vuota } = useConfigurazione();

  const schede: TabItem[] = gruppi.map(g => ({
    id: g.tipo,
    icon: TIPI[g.tipo].icona,
    label: (
      <span className='inline-flex items-center gap-2'>
        {TIPI[g.tipo].plurale}
        <span className='rounded-full bg-bg-secondary px-2 py-0.5 text-xs font-semibold tabular-nums text-text-secondary'>
          {g.controlli.length}
        </span>
      </span>
    ),
    content: <SchedaTipo gruppo={g} />,
  }));

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Configurazione'
        subtitle='Le categorie e i controlli con cui Vigilo segue le scadenze della tua azienda.'
        onRefresh={ricarica}
        isLoading={caricamento}
        actions={<Button onClick={() => navigate('/vigilo/avvio')}>Aggiungi dalla libreria</Button>}
      />

      {errore && (
        <Alert variant='danger' title='Impossibile leggere la configurazione'>
          {errore}
        </Alert>
      )}

      {stato && <Impostazioni stato={stato} />}

      {caricamento && !gruppi.length && <Skeleton className='h-96 rounded-lg' />}

      {vuota && (
        <div className='rounded-lg border border-dashed border-border-default p-8 text-center'>
          <p className='font-medium text-text-primary'>Nessuna categoria e nessun controllo</p>
          <p className='mt-1 text-sm text-text-secondary'>Prendili dalla libreria EDG: potrai cambiarli quando vuoi.</p>
        </div>
      )}

      {schede.length > 0 && <Tabs items={schede} defaultTab={schede[0].id} />}
    </div>
  );
};

export default ConfigurazionePage;
