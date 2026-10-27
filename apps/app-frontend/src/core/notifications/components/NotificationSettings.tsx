// src/core/notifications/components/NotificationSettings.tsx
//
// La scheda Preferenze della pagina /avvisi: una sezione per ogni modulo che
// dà il componente delle sue preferenze (settings nel manifest). Il core non
// sa cosa c'è dentro: ogni modulo legge e salva da sé.
import React, { Suspense } from 'react';
import { Skeleton } from '@edg/ui';

import type { ActiveNotificationSource } from '../types';

export const NotificationSettings: React.FC<{ sources: ActiveNotificationSource[] }> = ({ sources }) => (
  <div className='space-y-8'>
    {sources.map(({ key, name, source }) => {
      const Preferenze = source.settings!;
      return (
        <section key={key} className='space-y-3' aria-labelledby={`preferenze-${key}`}>
          <h2 id={`preferenze-${key}`} className='text-lg font-semibold text-text-primary'>
            {name}
          </h2>
          <Suspense fallback={<Skeleton className='h-64 rounded-lg' />}>
            <Preferenze />
          </Suspense>
        </section>
      );
    })}
  </div>
);
