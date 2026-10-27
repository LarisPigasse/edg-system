// src/features/vigilo/pages/AvvisiPage.tsx
//
// Vigilo › Avvisi (B8d-1, B8d-1 bis): gli avvisi del solo Vigilo, con il
// filtro per tipo di soggetto, e le preferenze di Vigilo (lo stesso
// componente della pagina /avvisi della piattaforma). Voce del menu di
// Vigilo; ?scheda=preferenze apre direttamente le preferenze. Ogni utente
// vede e cambia solo i propri.
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader, Tabs, type TabItem } from '@edg/ui';

import { ElencoAvvisi } from '../components/avvisi/ElencoAvvisi';
import PreferenzeVigilo from '../components/avvisi/PreferenzeVigilo';
import { useMieiAvvisi } from '../hooks/useMieiAvvisi';

const BASE = '/vigilo';
const SCHEDE = ['avvisi', 'preferenze'] as const;

const AvvisiPage: React.FC = () => {
  const [parametri, setParametri] = useSearchParams();
  const elenco = useMieiAvvisi();

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
    { id: 'preferenze', label: 'Preferenze', content: <PreferenzeVigilo /> },
  ];

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Avvisi'
        subtitle='Gli avvisi delle scadenze che arrivano a te e come vuoi riceverli.'
        onRefresh={() => void elenco.ricarica()}
        isLoading={elenco.caricamento}
      />
      <Tabs items={schede} defaultTab={iniziale} onTabChange={cambiaScheda} />
    </div>
  );
};

export default AvvisiPage;
