// src/features/vigilo/components/dashboard/RiquadriStato.tsx
//
// I cinque numeri in testa alla dashboard: cifra grande nel colore della
// fascia, etichetta a destra; la spiegazione è nel tooltip. Ognuno filtra le
// cose da fare; un secondo clic toglie il filtro.
import React from 'react';
import { Skeleton, Tooltip, cn } from '@edg/ui';

import { FASCE_ASPETTO } from '../../constants/fasce';
import type { Conteggi } from '../../types/dashboard';
import { DEFINIZIONI, RIQUADRI, type Vista } from '../../constants/viste';

interface Props {
  conteggi: Conteggi | null;
  vista: Vista;
  onScegli: (v: Vista) => void;
}

export const RiquadriStato: React.FC<Props> = ({ conteggi, vista, onScegli }) => (
  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
    {RIQUADRI.map(v => {
      const d = DEFINIZIONI[v];
      const n = conteggi ? d.conteggio(conteggi) : null;
      const scelto = vista === v;
      return (
        <Tooltip key={v} content={d.info}>
          <button
            type='button'
            aria-pressed={scelto}
            aria-description={d.info}
            onClick={() => onScegli(v)}
            className={cn(
              'flex min-h-20 items-center gap-4 rounded-lg border bg-bg-primary px-4 py-4 text-left transition-all',
              'hover:shadow-themed-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary',
              scelto ? 'border-action-primary' : 'border-border-thin'
            )}
          >
            {n === null ? (
              <Skeleton className='h-14 w-16' />
            ) : (
              <span
                className={cn(
                  'text-[56px] font-bold leading-none tracking-tight tabular-nums',
                  n ? FASCE_ASPETTO[d.fascia!].numero : 'text-text-disabled'
                )}
              >
                {n}
              </span>
            )}
            <span className='min-w-0 flex-1 space-y-1'>
              <span className='block text-base font-bold text-text-primary'>{d.etichetta}</span>
              <span className='block text-sm text-text-secondary'>{conteggi ? d.sotto(conteggi) : ' '}</span>
            </span>
          </button>
        </Tooltip>
      );
    })}
  </div>
);
