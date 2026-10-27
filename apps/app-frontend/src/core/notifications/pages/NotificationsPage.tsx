// src/core/notifications/pages/NotificationsPage.tsx
//
// I miei avvisi (B8d-1 bis): la pagina della piattaforma, collegata in fondo
// alla campanella. Avvisi di tutti i moduli che l'utente usa e, in una
// seconda scheda, le preferenze di ciascun modulo. ?scheda=preferenze apre
// direttamente le preferenze.
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader, Tabs, type TabItem } from '@edg/ui';

import { NotificationList } from '../components/NotificationList';
import { NotificationSettings } from '../components/NotificationSettings';
import { useNotificationSources } from '../hooks/useNotificationSources';
import { usePlatformNotifications } from '../hooks/usePlatformNotifications';

const SCHEDE = ['avvisi', 'preferenze'] as const;

const NotificationsPage: React.FC = () => {
  const [parametri, setParametri] = useSearchParams();
  const { sources } = useNotificationSources();
  const avvisi = usePlatformNotifications();
  const conPreferenze = sources.filter(s => s.source.settings);

  const richiesta = parametri.get('scheda');
  const iniziale = SCHEDE.find(s => s === richiesta && (s !== 'preferenze' || conPreferenze.length)) ?? 'avvisi';
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
          {avvisi.unread > 0 && (
            <span className='rounded-full bg-action-primary px-2 py-0.5 text-xs font-semibold tabular-nums text-action-primary-text'>{avvisi.unread}</span>
          )}
        </span>
      ),
      content: <NotificationList s={avvisi} />,
    },
    ...(conPreferenze.length ? [{ id: 'preferenze', label: 'Preferenze', content: <NotificationSettings sources={conPreferenze} /> }] : []),
  ];

  return (
    <div className='space-y-6'>
      <PageHeader
        title='I miei avvisi'
        subtitle='Gli avvisi di tutti i moduli che usi e come vuoi riceverli.'
        onRefresh={() => void avvisi.reload()}
        isLoading={avvisi.loading}
      />
      <Tabs items={schede} defaultTab={iniziale} onTabChange={cambiaScheda} />
    </div>
  );
};

export default NotificationsPage;
