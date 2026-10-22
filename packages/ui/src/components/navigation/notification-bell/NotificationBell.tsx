// packages/ui/src/components/navigation/notification-bell/NotificationBell.tsx
//
// La campanella degli avvisi (ADR091): pulsante con il numero dei da leggere
// (rosso se fra questi ce n'è uno urgente) e pannello con le voci più
// recenti, "Segna tutti come letti" e un collegamento in fondo. Non sa da
// dove arrivano gli avvisi: voci e azioni le dà l'applicazione
// (EdgNotifications). Al clic su una voce chiama onSelect e porta al suo
// indirizzo.
import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Link, useNavigate } from 'react-router-dom';

import type { EdgNotification, EdgNotifications, EdgNotificationTone } from '../../../config/types';
import { Bell, BellOff, CheckCheck } from '../../../utils/icons';
import { cn } from '../../../utils';
import { Skeleton } from '../../feedback';
import { badgeText, relativeTime } from './notificationBell.utils';

export interface NotificationBellProps extends EdgNotifications {
  /** Titolo del pannello */
  title?: string;
  className?: string;
}

const PALLINO: Record<EdgNotificationTone, string> = {
  default: 'bg-action-primary',
  warning: 'bg-action-warning',
  danger: 'bg-action-danger',
};

const Voce: React.FC<{ n: EdgNotification; onClick: () => void }> = ({ n, onClick }) => {
  const quando = relativeTime(n.date);
  return (
    <li>
      <button
        type='button'
        onClick={onClick}
        className={cn(
          'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-hover focus-visible:bg-bg-hover focus-visible:outline-none',
          n.unread && 'bg-bg-secondary/60'
        )}
      >
        {/* pallino solo sui da leggere; lo spazio resta, così i testi si allineano */}
        <span aria-hidden className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.unread ? PALLINO[n.tone ?? 'default'] : 'bg-transparent')} />
        <span className='min-w-0 flex-1'>
          <span className={cn('block text-sm leading-snug', n.resolved ? 'text-text-secondary' : 'text-text-primary', n.unread && 'font-semibold')}>
            {n.text}
          </span>
          {n.detail && <span className='mt-0.5 block text-sm leading-snug text-text-secondary'>{n.detail}</span>}
          <span className='mt-1 block text-xs text-text-secondary'>
            {[n.source, quando, n.resolved ? 'non serve più' : null].filter(Boolean).join(' · ')}
          </span>
        </span>
        {n.unread && <span className='sr-only'>(da leggere)</span>}
      </button>
    </li>
  );
};

const NotificationBell: React.FC<NotificationBellProps> = ({
  items,
  unread,
  loading,
  error,
  onOpen,
  onSelect,
  onReadAll,
  footer,
  title = 'Avvisi',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const urgente = items.some(n => n.unread && n.tone === 'danger');

  const cambia = (o: boolean) => {
    setOpen(o);
    if (o) onOpen?.();
  };
  const scegli = (n: EdgNotification) => {
    setOpen(false);
    onSelect?.(n);
    if (n.href) navigate(n.href);
  };

  return (
    <Popover.Root open={open} onOpenChange={cambia}>
      <Popover.Trigger asChild>
        <button
          type='button'
          className={cn(
            'relative rounded-lg p-2 transition-colors hover:bg-bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary',
            className
          )}
          title={title}
          aria-label={unread ? `${title}: ${unread} da leggere` : title}
        >
          <Bell className='h-5 w-5 text-text-primary' />
          {unread > 0 && (
            <span
              aria-hidden
              className={cn(
                'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums leading-none',
                urgente ? 'bg-action-danger text-action-danger-text' : 'bg-action-primary text-action-primary-text'
              )}
            >
              {badgeText(unread)}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align='end'
          sideOffset={8}
          collisionPadding={16}
          className={cn(
            'z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-border-default bg-bg-primary shadow-xl',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 motion-reduce:animate-none'
          )}
        >
          {/* intestazione */}
          <div className='flex items-center justify-between gap-3 border-b border-border-default px-4 py-3'>
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-text-primary'>{title}</p>
              <p className='text-xs text-text-secondary'>{unread ? `${unread} da leggere` : 'Nessuno da leggere'}</p>
            </div>
            {onReadAll && (
              <button
                type='button'
                onClick={onReadAll}
                disabled={!unread}
                className='inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-text-link transition-colors hover:bg-bg-hover disabled:cursor-default disabled:text-text-secondary disabled:opacity-60 disabled:hover:bg-transparent'
              >
                <CheckCheck className='h-4 w-4' aria-hidden />
                Segna tutti come letti
              </button>
            )}
          </div>

          {/* voci */}
          <div className='max-h-[min(28rem,60vh)] overflow-y-auto'>
            {error && !items.length ? (
              <p className='px-4 py-6 text-center text-sm text-text-danger'>{error}</p>
            ) : loading && !items.length ? (
              <div className='space-y-3 p-4'>
                {[0, 1, 2].map(i => (
                  <div key={i} className='space-y-1.5'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-3 w-1/3' />
                  </div>
                ))}
              </div>
            ) : !items.length ? (
              <div className='flex flex-col items-center gap-2 px-4 py-8 text-center'>
                <BellOff className='h-6 w-6 text-text-secondary' aria-hidden />
                <p className='text-sm text-text-secondary'>Nessun avviso, per ora.</p>
              </div>
            ) : (
              <ul className='divide-y divide-border-thin'>
                {items.map(n => (
                  <Voce key={n.id} n={n} onClick={() => scegli(n)} />
                ))}
              </ul>
            )}
          </div>

          {footer && (
            <div className='border-t border-border-default px-4 py-2.5'>
              <Link to={footer.href} onClick={() => setOpen(false)} className='text-sm font-medium text-text-link hover:underline'>
                {footer.label}
              </Link>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default NotificationBell;
