// src/core/assistenza/components/SchedeAccessi.tsx
//
// Gli accessi come schede, sotto i 1280 px (due per riga dai 768): in alto
// quando e stato, poi chi e la modalità, il motivo e la durata.
import React from 'react';
import { Skeleton } from '@edg/ui';

import type { AccessoAssistenza } from '../types';
import { durataAccesso, quandoAccesso } from '../utils';
import { ModalitaAccesso } from './ModalitaAccesso';
import { StatoAccesso } from './StatoAccesso';

export const SchedeAccessi: React.FC<{ accessi: AccessoAssistenza[]; caricamento: boolean }> = ({ accessi, caricamento }) => {
  if (caricamento && !accessi.length) {
    return (
      <div className='space-y-3'>
        <Skeleton className='h-32 w-full rounded-lg' />
        <Skeleton className='h-32 w-full rounded-lg' />
      </div>
    );
  }
  if (!accessi.length) return <p className='py-8 text-center text-sm text-text-secondary'>Nessun accesso dell'assistenza EDG finora.</p>;

  return (
    <ul className='grid gap-3 md:grid-cols-2'>
      {accessi.map(a => (
        <li key={a.uuid} className='space-y-2 rounded-lg border border-border-default bg-bg-primary p-4'>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-sm font-semibold text-text-primary'>{quandoAccesso(a.inizio)}</span>
            <StatoAccesso stato={a.stato} />
          </div>
          <div className='text-sm'>
            <span className='text-text-primary'>{a.operatore}</span>
            <span className='text-text-secondary'> · Assistenza EDG</span>
          </div>
          <div className='text-sm'>
            <ModalitaAccesso a={a} />
          </div>
          <p className='text-sm text-text-secondary'>{a.motivo}</p>
          <p className='text-xs text-text-secondary'>Durata: {durataAccesso(a)}</p>
        </li>
      ))}
    </ul>
  );
};
