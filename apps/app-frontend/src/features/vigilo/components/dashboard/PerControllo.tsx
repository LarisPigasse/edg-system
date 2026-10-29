// src/features/vigilo/components/dashboard/PerControllo.tsx
//
// Le scadenze da fare per controllo, dalla più grave: il numero ha il colore
// dello stato peggiore. Ne mostra 8, le altre a richiesta. Ogni riga porta
// all'elenco delle scadenze di quel controllo (tutti i controlli con quel nome).
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@edg/ui';

import { Riquadro } from '../Riquadro';
import { STATI_ASPETTO } from '../../constants/stati';
import type { Dashboard } from '../../types/dashboard';

const VISIBILI = 8;

export const PerControllo: React.FC<{ righe: Dashboard['perControllo'] }> = ({ righe }) => {
  const [tutti, setTutti] = useState(false);
  const mostrati = tutti ? righe : righe.slice(0, VISIBILI);
  const altri = righe.length - VISIBILI;
  return (
    <Riquadro titolo='Per controllo'>
      {righe.length === 0 ? (
        <p className='text-sm text-text-secondary'>Niente da fare.</p>
      ) : (
        <ul>
          {mostrati.map(r => (
            <li key={r.nome} className='border-t border-border-thin first:border-t-0'>
              <Link
                to={r.natura ? `/vigilo/scadenze?natura=${r.natura}` : `/vigilo/scadenze?controllo=${r.uuids.join(',')}`}
                className='-mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary'
              >
                <span className='min-w-0 flex-1 truncate text-sm font-medium text-text-primary'>{r.nome}</span>
                <span className={cn('min-w-8 text-right text-xl font-bold tabular-nums', STATI_ASPETTO[r.peggiore].numero)}>{r.n}</span>
              </Link>
            </li>
          ))}
          {altri > 0 && (
            <li className='border-t border-border-thin pt-2'>
              <button type='button' onClick={() => setTutti(t => !t)} className='text-sm text-text-link hover:underline'>
                {tutti ? 'Mostra meno' : `Altri ${altri} ${altri === 1 ? 'controllo' : 'controlli'}`}
              </button>
            </li>
          )}
        </ul>
      )}
    </Riquadro>
  );
};
