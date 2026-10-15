// src/features/vigilo/components/dashboard/Soggetti.tsx
//
// Quanti soggetti per tipo, con il pallino dello stato peggiore e una nota.
// Ogni riquadro porta all'elenco dei soggetti di quel tipo.
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@edg/ui';

import { Riquadro } from '../Riquadro';
import { STATI_ASPETTO } from '../../constants/stati';
import { TIPI } from '../../constants/tipiSoggetto';
import type { Dashboard } from '../../types/dashboard';
import { TIPI_SOGGETTO } from '../../types/valori';

const nota = (s: Dashboard['soggetti'][number]) => {
  if (s.critici) return `${s.critici} con scadenze superate`;
  if (s.peggiore === 'in-scadenza') return 'scadenze in arrivo';
  if (s.peggiore === 'da-completare') return 'date da completare';
  if (s.peggiore === 'in-regola') return 'tutto in regola';
  return 'nessuna scadenza';
};

/** Il pallino: bg-current prende il colore del testo dello stato */
const pallino = (s: Dashboard['soggetti'][number]) => (s.peggiore ? STATI_ASPETTO[s.peggiore].numero : 'text-text-disabled');

export const Soggetti: React.FC<{ soggetti: Dashboard['soggetti'] }> = ({ soggetti }) => {
  const ordinati = [...soggetti].sort((a, b) => TIPI_SOGGETTO.indexOf(a.tipo) - TIPI_SOGGETTO.indexOf(b.tipo));
  return (
    <Riquadro titolo='Soggetti'>
      {ordinati.length === 0 ? (
        <p className='text-sm text-text-secondary'>Nessun soggetto inserito.</p>
      ) : (
        <div className='grid grid-cols-2 gap-3'>
          {ordinati.map(s => {
            return (
              <Link
                key={s.tipo}
                to={`/vigilo/soggetti?tipo=${s.tipo}`}
                className='block space-y-1 rounded-lg border border-transparent bg-bg-base p-3 transition-colors hover:border-border-default hover:bg-bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary'
              >
                <span className='flex items-center justify-between'>
                  <span className='text-4xl font-bold leading-none tabular-nums text-text-primary'>{s.n}</span>
                  <span aria-hidden className={cn('h-2.5 w-2.5 rounded-full bg-current', pallino(s))} />
                </span>
                <span className='block text-sm text-text-secondary'>
                  {s.n === 1 ? TIPI[s.tipo].singolare.replace(/^./, c => c.toUpperCase()) : TIPI[s.tipo].plurale}
                </span>
                <span className='block text-xs text-text-secondary'>{nota(s)}</span>
              </Link>
            );
          })}
        </div>
      )}
    </Riquadro>
  );
};
