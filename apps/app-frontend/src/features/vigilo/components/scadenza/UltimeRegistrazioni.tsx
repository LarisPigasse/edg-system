// src/features/vigilo/components/scadenza/UltimeRegistrazioni.tsx
//
// Che cosa è successo a questa scadenza: le ultime 4 registrazioni.
import React from 'react';

import type { Registrazione } from '../../types/scadenze';
import { giornoBreve } from '../../utils/giorni';
import { dettagliRegistrazione, descrizioneRegistrazione } from '../../utils/registrazioni';

const VISIBILI = 4;

export const UltimeRegistrazioni: React.FC<{ registrazioni: Registrazione[] }> = ({ registrazioni }) => (
  <section>
    <h3 className='mb-1 text-sm font-semibold text-text-primary'>Ultime registrazioni</h3>
    {registrazioni.length === 0 ? (
      <p className='text-sm text-text-secondary'>Nessuna registrazione finora.</p>
    ) : (
      <ol className='divide-y divide-border-default text-sm'>
        {registrazioni.slice(0, VISIBILI).map(r => (
          <li key={r.uuid} className='grid grid-cols-[6rem_1fr] gap-3 py-1.5'>
            <span className='text-text-secondary'>{giornoBreve(r.eseguitaIl)}</span>
            <span className='min-w-0'>
              <span className='text-text-primary'>{descrizioneRegistrazione(r)}</span>
              {dettagliRegistrazione(r) && <span className='block truncate text-xs text-text-secondary'>{dettagliRegistrazione(r)}</span>}
            </span>
          </li>
        ))}
      </ol>
    )}
  </section>
);
