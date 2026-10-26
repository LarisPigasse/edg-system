// src/features/vigilo/pages/AvvisiPage.tsx
//
// Vigilo › I miei avvisi (B8d-1): tutti i miei avvisi con i filtri e le mie
// preferenze (email e di che cosa). Ci si arriva dal collegamento in fondo
// alla campanella; ?scheda=preferenze apre direttamente le preferenze.
// Ogni utente di Vigilo vede e cambia solo i propri.
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader, Tabs, type TabItem } from '@edg/ui';
import { useAuth } from '@edg/auth';

import { ElencoAvvisi } from '../components/avvisi/ElencoAvvisi';
import { PreferenzeAvvisi } from '../components/avvisi/PreferenzeAvvisi';
import { useMieiAvvisi } from '../hooks/useMieiAvvisi';
import { usePreferenzeAvvisi } from '../hooks/usePreferenzeAvvisi';

const BASE = '/vigilo';
const SCHEDE = ['avvisi', 'preferenze'] as const;

const AvvisiPage: React.FC = () => {
  const [parametri, setParametri] = useSearchParams();
  const { account } = useAuth();
  const elenco = useMieiAvvisi();
  const preferenze = usePreferenzeAvvisi();

  const richiesta = parametri.get('scheda');
  const iniziale = SCHEDE.find(s => s === richiesta) ?? 'avvisi';
  // la scheda scelta resta nell'indirizzo, così "indietro" e il ricaricamento la ritrovano
  const cambiaScheda = (id: string) =>
    setParametri(
      p => {
        if (id === 'avvisi') p.delete('scheda');
        else p.set('scheda', id);
        return p;
      },
      { replace: true }
    );

  const schede: TabItem[] = [
    {
      id: 'avvisi',
      label: (
        <span className='inline-flex items-center gap-2'>
          Avvisi
          {elenco.nonLetti > 0 && (
            <span className='rounded-full bg-action-primary px-2 py-0.5 text-xs font-semibold tabular-nums text-action-primary-text'>{elenco.nonLetti}</span>
          )}
        </span>
      ),
      content: <ElencoAvvisi e={elenco} base={BASE} />,
    },
    { id: 'preferenze', label: 'Preferenze', content: <PreferenzeAvvisi p={preferenze} email={account?.email ?? null} /> },
  ];

  return (
    <div className='space-y-6'>
      <PageHeader
        title='I miei avvisi'
        subtitle='Gli avvisi delle scadenze che arrivano a te e come vuoi riceverli.'
        onRefresh={() => {
          void elenco.ricarica();
          void preferenze.ricarica();
        }}
        isLoading={elenco.caricamento || preferenze.caricamento}
      />
      <Tabs items={schede} defaultTab={iniziale} onTabChange={cambiaScheda} />
    </div>
  );
};

export default AvvisiPage;
