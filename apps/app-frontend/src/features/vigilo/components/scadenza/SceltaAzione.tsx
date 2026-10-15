// src/features/vigilo/components/scadenza/SceltaAzione.tsx
//
// Quale azione fare, con lo stesso interruttore della scelta della vista;
// che cosa fa ciascuna lo dice il tooltip.
import React from 'react';
import { Tooltip, cn } from '@edg/ui';

import { AZIONI, type Azione } from '../../constants/azioni';

interface Props {
  azioni: Azione[];
  attiva: Azione;
  onScegli: (a: Azione) => void;
}

export const SceltaAzione: React.FC<Props> = ({ azioni, attiva, onScegli }) => (
  <div className='flex rounded-lg border border-border-default bg-bg-primary p-0.5' role='group' aria-label='Azione'>
    {azioni.map(a => (
      <Tooltip key={a} content={AZIONI[a].info}>
        <button
          type='button'
          aria-pressed={attiva === a}
          onClick={() => onScegli(a)}
          className={cn(
            'h-9 flex-1 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-colors',
            attiva === a ? 'bg-action-primary text-action-primary-text' : 'text-text-secondary hover:bg-bg-hover'
          )}
        >
          {AZIONI[a].etichetta}
        </button>
      </Tooltip>
    ))}
  </div>
);
