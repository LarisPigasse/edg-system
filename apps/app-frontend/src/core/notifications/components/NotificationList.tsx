// src/core/notifications/components/NotificationList.tsx
//
// La scheda Avvisi della pagina /avvisi: filtro e, con più moduli, il modulo;
// poi gli avvisi di tutti i moduli dal più recente, a pagine da 32.
import React from 'react';
import { Alert, Button, Select, Skeleton } from '@edg/ui';

import { NOTIFICATION_FILTERS } from '../constants';
import type { PlatformNotificationsState } from '../hooks/usePlatformNotifications';
import type { NotificationFilter } from '../types';
import { NotificationRow } from './NotificationRow';

const TUTTI = 'tutti';

/** "12 avvisi · 3 da leggere" */
const conteggio = (totale: number, daLeggere: number) =>
  [`${totale} ${totale === 1 ? 'avviso' : 'avvisi'}`, daLeggere ? `${daLeggere} da leggere` : null].filter(Boolean).join(' · ');

export const NotificationList: React.FC<{ s: PlatformNotificationsState }> = ({ s }) => {
  const vuoto = NOTIFICATION_FILTERS.find(f => f.value === s.filter)?.empty ?? NOTIFICATION_FILTERS[0].empty;
  const primaLettura = s.loading && !s.items.length;

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-end gap-3'>
        <div className='w-44'>
          <Select
            optionSize='sm'
            label='Quali'
            value={s.filter}
            onValueChange={v => s.setFilter(v as NotificationFilter)}
            options={NOTIFICATION_FILTERS.map(({ value, label }) => ({ value, label }))}
          />
        </div>
        {/* il modulo si sceglie solo quando ce n'è più d'uno */}
        {s.modules.length > 1 && (
          <div className='w-44'>
            <Select
              optionSize='sm'
              label='Modulo'
              value={s.module ?? TUTTI}
              onValueChange={v => s.setModule(v === TUTTI ? undefined : v)}
              options={[{ value: TUTTI, label: 'Tutti i moduli' }, ...s.modules.map(m => ({ value: m.key, label: m.name }))]}
            />
          </div>
        )}
        {!primaLettura && <p className='pb-2 text-sm text-text-secondary'>{conteggio(s.total, s.unread)}</p>}
        <div className='ml-auto pb-0.5'>
          <Button variant='secondary' size='sm' onClick={() => void s.markAllRead()} disabled={!s.unread}>
            Segna tutti come letti
          </Button>
        </div>
      </div>

      {s.error && (
        <Alert variant='warning' title='Avvisi incompleti'>
          {s.error}
        </Alert>
      )}

      <div className='overflow-hidden rounded-lg border border-border-default bg-bg-primary'>
        {primaLettura ? (
          <div className='space-y-4 p-4'>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className='space-y-1.5'>
                <Skeleton className='h-4 w-1/2' />
                <Skeleton className='h-3 w-1/3' />
              </div>
            ))}
          </div>
        ) : !s.items.length ? (
          <p className='px-4 py-8 text-center text-sm text-text-secondary'>{s.modules.length ? vuoto : 'Nessun modulo con avvisi fra quelli che usi.'}</p>
        ) : (
          <ul className='divide-y divide-border-thin'>
            {s.items.map(n => (
              <NotificationRow key={n.key} n={n} source={n.source} onOpen={() => s.markRead(n)} />
            ))}
          </ul>
        )}
      </div>

      {s.more && (
        <div className='flex justify-center'>
          <Button variant='secondary' onClick={() => void s.showMore()} isLoading={s.loading} loadingText='Carico…'>
            Mostra altri ({s.total - s.items.length})
          </Button>
        </div>
      )}
    </div>
  );
};
