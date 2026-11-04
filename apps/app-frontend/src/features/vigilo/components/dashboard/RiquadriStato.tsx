// src/features/vigilo/components/dashboard/RiquadriStato.tsx
//
// I cinque numeri in testa alla dashboard: cifra grande nel colore della
// fascia, etichetta a destra; la spiegazione è nel tooltip. Ognuno filtra le
// cose da fare; un secondo clic toglie il filtro. Con segnalazioni degli
// addetti da confermare (solo a chi ha vigilo.write) un sesto riquadro, in
// viola, porta al loro elenco: sei in fila da 1600 px (sotto le etichette
// andrebbero a capo), tre per riga quando lo schermo è più stretto.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton, Tooltip, cn } from '@edg/ui';

import { FASCE_ASPETTO } from '../../constants/fasce';
import type { Conteggi } from '../../types/dashboard';
import { DEFINIZIONI, RIQUADRI, type Vista } from '../../constants/viste';

interface Props {
  conteggi: Conteggi | null;
  vista: Vista;
  onScegli: (v: Vista) => void;
  /** Segnalazioni degli addetti da confermare: con più di zero, il sesto riquadro (B9c) */
  daConfermare?: number;
}

const CASELLA = cn(
  'flex min-h-20 items-center gap-4 rounded-lg border bg-bg-primary px-4 py-4 text-left transition-all',
  'hover:shadow-themed-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary'
);

/** Il sesto riquadro: le segnalazioni da confermare, verso il loro elenco */
const DaConfermare: React.FC<{ n: number }> = ({ n }) => {
  const navigate = useNavigate();
  const info = 'Gli addetti hanno segnalato cose fatte: controllale e confermale, così le scadenze si chiudono.';
  return (
    <Tooltip content={info}>
      <button type='button' aria-description={info} onClick={() => navigate('/vigilo/scadenze?stato=segnalate')} className={cn(CASELLA, 'border-border-thin')}>
        <span className='text-[56px] font-bold leading-none tracking-tight tabular-nums text-action-primary'>{n}</span>
        <span className='min-w-0 flex-1 space-y-1'>
          <span className='block text-base font-bold text-text-primary'>Da confermare</span>
          <span className='block text-sm text-text-secondary'>{n === 1 ? 'segnalazione degli addetti' : 'segnalazioni degli addetti'}</span>
        </span>
      </button>
    </Tooltip>
  );
};

export const RiquadriStato: React.FC<Props> = ({ conteggi, vista, onScegli, daConfermare = 0 }) => (
  <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', daConfermare > 0 ? 'min-[100rem]:grid-cols-6' : 'xl:grid-cols-5')}>
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
            className={cn(CASELLA, scelto ? 'border-action-primary' : 'border-border-thin')}
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
    {daConfermare > 0 && <DaConfermare n={daConfermare} />}
  </div>
);
