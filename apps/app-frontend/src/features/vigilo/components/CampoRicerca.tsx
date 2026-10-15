// src/features/vigilo/components/CampoRicerca.tsx
//
// Il campo di ricerca di Vigilo, uguale ovunque (dashboard, soggetti…).
import React from 'react';
import { Search, cn } from '@edg/ui';

interface Props {
  valore: string;
  onCambia: (testo: string) => void;
  segnaposto: string;
  className?: string;
}

export const CampoRicerca: React.FC<Props> = ({ valore, onCambia, segnaposto, className }) => (
  <label className={cn('relative block', className)}>
    <span className='sr-only'>Cerca</span>
    <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary' aria-hidden />
    <input
      type='search'
      value={valore}
      onChange={e => onCambia(e.target.value)}
      placeholder={segnaposto}
      className='h-10 w-full rounded-lg border border-border-default bg-bg-primary pl-9 pr-3 text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-action-primary'
    />
  </label>
);
