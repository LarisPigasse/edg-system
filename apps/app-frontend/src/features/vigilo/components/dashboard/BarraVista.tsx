// src/features/vigilo/components/dashboard/BarraVista.tsx
//
// La barra sotto il titolo: a sinistra la scelta della vista, a destra la
// ricerca (veicolo, persona, targa).
import React from 'react';
import { cn } from '@edg/ui';

import type { VistaDashboard } from '../../types/dashboard';
import { CampoRicerca } from '../CampoRicerca';

const VISTE: readonly (readonly [VistaDashboard, string])[] = [
  ['fare', 'Da fare'],
  ['spese', 'Spese e consumi'],
];

interface Props {
  vista: VistaDashboard;
  onVista: (v: VistaDashboard) => void;
  testo: string;
  onTesto: (t: string) => void;
}

export const BarraVista: React.FC<Props> = ({ vista, onVista, testo, onTesto }) => (
  <div className='flex flex-wrap items-center justify-between gap-3'>
    <div className='flex rounded-lg border border-border-default bg-bg-primary p-0.5' role='group' aria-label='Vista'>
      {VISTE.map(([v, etichetta]) => (
        <button
          key={v}
          type='button'
          aria-pressed={vista === v}
          onClick={() => onVista(v)}
          className={cn(
            'h-9 rounded-lg px-4 text-sm font-semibold transition-colors',
            vista === v ? 'bg-action-primary text-action-primary-text' : 'text-text-secondary hover:bg-bg-hover'
          )}
        >
          {etichetta}
        </button>
      ))}
    </div>
    <CampoRicerca valore={testo} onCambia={onTesto} segnaposto='Cerca veicolo, persona, targa…' className='w-72' />
  </div>
);
