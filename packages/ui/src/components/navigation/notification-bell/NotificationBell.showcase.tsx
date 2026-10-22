// packages/ui/src/components/navigation/notification-bell/NotificationBell.showcase.tsx
import React, { useState } from 'react';

import type { EdgNotification } from '../../../config/types';
import { TitledSurface } from '../../layout';
import NotificationBell from './NotificationBell';

const minutiFa = (m: number) => new Date(Date.now() - m * 60000).toISOString();

const ESEMPIO: EdgNotification[] = [
  { id: '1', text: "Scarico dati dell'unità di bordo", detail: 'Iveco S-Way 01 (GH128KM) · scaduta da 6 giorni · 16 ott', source: 'Vigilo', tone: 'danger', unread: true, date: minutiFa(8) },
  { id: '2', text: 'Controllo periodico del tachigrafo', detail: 'Iveco S-Way 01 (GH128KM) · scade tra 2 giorni · 24 ott', source: 'Vigilo', tone: 'warning', unread: true, date: minutiFa(128) },
  { id: '3', text: 'Tagliando', detail: 'Fiat Ducato 01 (GK256LT) · scade tra 9 giorni · 31 ott', source: 'Vigilo', unread: false, date: minutiFa(1600) },
  { id: '4', text: 'Revisione', detail: 'Fiat Ducato 01 (GK256LT) · scade tra 39 giorni · 30 nov', source: 'Vigilo', unread: false, resolved: true, date: minutiFa(8192) },
];

export const NotificationBellShowcase: React.FC = () => {
  const [voci, setVoci] = useState(ESEMPIO);
  const unread = voci.filter(v => v.unread).length;
  return (
    <div className='space-y-8'>
      <TitledSurface title='Con avvisi' variant='primary' padding='lg'>
        <div className='flex items-center gap-4'>
          <NotificationBell
            items={voci}
            unread={unread}
            onSelect={n => setVoci(v => v.map(x => (x.id === n.id ? { ...x, unread: false } : x)))}
            onReadAll={() => setVoci(v => v.map(x => ({ ...x, unread: false })))}
          />
          <button type='button' className='text-sm text-text-link hover:underline' onClick={() => setVoci(ESEMPIO)}>
            Ripristina l'esempio
          </button>
        </div>
        <p className='mt-4 text-sm text-text-secondary'>Il numero è rosso finché fra i da leggere c'è un avviso urgente; il pallino ha il colore della voce.</p>
      </TitledSurface>

      <TitledSurface title='Vuota e in caricamento' variant='secondary' padding='lg'>
        <div className='flex items-center gap-4'>
          <NotificationBell items={[]} unread={0} />
          <NotificationBell items={[]} unread={0} loading />
        </div>
      </TitledSurface>
    </div>
  );
};

export default NotificationBellShowcase;
