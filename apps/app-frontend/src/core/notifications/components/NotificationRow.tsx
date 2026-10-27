// src/core/notifications/components/NotificationRow.tsx
//
// Un avviso in un elenco, come nella campanella: testo sopra (in grassetto se
// da leggere), dettaglio sotto, pallino del tono; a destra il modulo (se
// richiesto), quando è nato e, se superato, "non serve più". Il clic chiama
// onOpen e porta all'indirizzo dell'avviso. La usano la pagina /avvisi e le
// pagine degli avvisi dei moduli.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn, type EdgNotificationTone } from '@edg/ui';

import type { ModuleNotification } from '../types';
import { quandoNotifica } from '../utils/quando';

const PALLINO: Record<EdgNotificationTone, string> = {
  default: 'bg-action-primary',
  warning: 'bg-action-warning',
  danger: 'bg-action-danger',
};

export const NotificationRow: React.FC<{ n: ModuleNotification; source?: string; onOpen: () => void }> = ({ n, source, onOpen }) => {
  const navigate = useNavigate();
  const apri = () => {
    onOpen();
    if (n.href) navigate(n.href);
  };

  return (
    <li>
      <button
        type='button'
        onClick={apri}
        className={cn(
          'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-hover focus-visible:bg-bg-hover focus-visible:outline-none',
          n.unread && 'bg-bg-secondary/60'
        )}
      >
        {/* pallino solo sui da leggere; lo spazio resta, così i testi si allineano */}
        <span aria-hidden className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.unread ? PALLINO[n.tone ?? 'default'] : 'bg-transparent')} />
        <span className='min-w-0 flex-1'>
          <span className={cn('block text-sm leading-snug', n.resolved ? 'text-text-secondary' : 'text-text-primary', n.unread && 'font-semibold')}>{n.text}</span>
          {n.detail && <span className='mt-0.5 block text-sm leading-snug text-text-secondary'>{n.detail}</span>}
        </span>
        <span className='shrink-0 text-right text-xs leading-snug text-text-secondary'>
          {source && <span className='block font-medium text-text-label'>{source}</span>}
          <span className='block whitespace-nowrap tabular-nums'>{quandoNotifica(n.date)}</span>
          {n.resolved && <span className='mt-0.5 block whitespace-nowrap'>non serve più</span>}
          {n.unread && <span className='sr-only'>(da leggere)</span>}
        </span>
      </button>
    </li>
  );
};
