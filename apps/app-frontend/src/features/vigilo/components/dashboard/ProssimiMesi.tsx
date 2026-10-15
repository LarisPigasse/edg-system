// src/features/vigilo/components/dashboard/ProssimiMesi.tsx
//
// Quante scadenze cadono nei prossimi 12 mesi: una tessera per mese, più
// scura dove il lavoro è di più (azzurro, dal chiaro allo scuro).
import React from 'react';
import { cn } from '@edg/ui';

import { Riquadro } from '../Riquadro';
import type { Dashboard } from '../../types/dashboard';

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

/** Una sola tinta (sky), dal chiaro allo scuro; soglie a potenze di 2: 0 · 1 · 2-3 · 4-7 · 8 e oltre */
const tinta = (n: number) =>
  n === 0
    ? 'bg-bg-secondary text-text-disabled'
    : n === 1
      ? 'bg-sky-100 text-sky-900 [.dark_&]:bg-sky-950 [.dark_&]:text-sky-200'
      : n < 4
        ? 'bg-sky-200 text-sky-900 [.dark_&]:bg-sky-900 [.dark_&]:text-sky-100'
        : n < 8
          ? 'bg-sky-400 text-sky-950 [.dark_&]:bg-sky-700 [.dark_&]:text-white'
          : 'bg-sky-600 text-white [.dark_&]:bg-sky-500';

export const ProssimiMesi: React.FC<{ perMese: Dashboard['perMese'] }> = ({ perMese }) => {
  const annoCorrente = perMese.mesi[0]?.mese.slice(0, 4);
  return (
    <Riquadro
      className='h-full'
      titolo='I prossimi 12 mesi'
      azioni={
        perMese.arretrato > 0 && (
          <span className='text-sm text-text-secondary'>
            {perMese.arretrato} {perMese.arretrato === 1 ? 'rimasta' : 'rimaste'} indietro dai mesi scorsi
          </span>
        )
      }
    >
      <p className='-mt-2 mb-4 text-sm text-text-secondary'>Quante scadenze cadono in ogni mese.</p>
      <ol className='grid grid-cols-4 gap-2'>
        {perMese.mesi.map(m => {
          const [anno, mese] = m.mese.split('-');
          const etichetta = `${MESI[Number(mese) - 1]}${anno !== annoCorrente ? ` ${anno.slice(2)}` : ''}`;
          return (
            <li
              key={m.mese}
              title={`${m.n} ${m.n === 1 ? 'scadenza' : 'scadenze'} in ${MESI[Number(mese) - 1]} ${anno}`}
              className={cn('flex flex-col items-center gap-0.5 rounded-lg px-1 py-3', tinta(m.n))}
            >
              <span className='text-xs font-semibold capitalize'>{etichetta}</span>
              <span className='text-xl font-bold tabular-nums'>{m.n}</span>
            </li>
          );
        })}
      </ol>
    </Riquadro>
  );
};
