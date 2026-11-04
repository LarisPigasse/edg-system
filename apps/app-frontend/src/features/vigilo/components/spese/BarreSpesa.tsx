// src/features/vigilo/components/spese/BarreSpesa.tsx
//
// Un elenco a barre orizzontali: nome (con un'etichetta accanto), cifra a
// destra e la barra in proporzione alla voce più grande. Per natura e per
// fornitore.
import React from 'react';
import { cn } from '@edg/ui';

import { euroTondi } from '../../utils/resoconti';

export interface VoceBarra {
  chiave: string;
  nome: string;
  accanto?: React.ReactNode;
  valore: number;
  /** Classe del colore della barra (predefinito il colore principale) */
  colore?: string;
}

export const BarreSpesa: React.FC<{ voci: VoceBarra[]; vuoto: string }> = ({ voci, vuoto }) => {
  if (!voci.length) return <p className='py-4 text-sm text-text-secondary'>{vuoto}</p>;
  const massimo = Math.max(1, ...voci.map(v => v.valore));
  return (
    <ul className='flex flex-col gap-3'>
      {voci.map(v => (
        <li key={v.chiave} className='grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1'>
          <span className='min-w-0 truncate font-semibold text-text-primary'>
            {v.nome}
            {v.accanto && <span className='ml-2 text-xs font-normal text-text-secondary'>{v.accanto}</span>}
          </span>
          <span className='font-semibold tabular-nums text-text-primary'>{euroTondi(v.valore)}</span>
          <span className='col-span-2 h-1.5 overflow-hidden rounded-full bg-border-thin'>
            <span className={cn('block h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none', v.colore ?? 'bg-action-primary')} style={{ width: `${(v.valore / massimo) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
};
