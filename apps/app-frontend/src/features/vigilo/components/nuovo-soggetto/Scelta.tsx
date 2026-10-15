// src/features/vigilo/components/nuovo-soggetto/Scelta.tsx
//
// Un riquadro da scegliere (tipo o categoria): bordo e fondo che si
// accendono quando è scelto.
import React from 'react';
import { cn, type LucideIcon } from '@edg/ui';

interface Props {
  titolo: string;
  dettaglio?: string;
  icona?: LucideIcon;
  scelto: boolean;
  onScegli: () => void;
}

export const Scelta: React.FC<Props> = ({ titolo, dettaglio, icona: Icona, scelto, onScegli }) => (
  <button
    type='button'
    aria-pressed={scelto}
    onClick={onScegli}
    className={cn(
      'flex min-h-20 items-start gap-3 rounded-lg border bg-bg-primary p-4 text-left transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary',
      scelto ? 'border-action-primary bg-bg-selected' : 'border-border-default hover:border-border-strong hover:bg-bg-hover'
    )}
  >
    {Icona && <Icona className={cn('mt-0.5 h-5 w-5 shrink-0', scelto ? 'text-action-primary' : 'text-text-secondary')} aria-hidden />}
    <span className='min-w-0'>
      <span className='block font-semibold text-text-primary'>{titolo}</span>
      {dettaglio && <span className='mt-0.5 block text-sm text-text-secondary'>{dettaglio}</span>}
    </span>
  </button>
);
