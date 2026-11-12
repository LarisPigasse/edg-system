// src/features/vigilo/components/Riquadro.tsx
//
// Il riquadro delle pagine di Vigilo: fondo chiaro, angoli morbidi, titolo
// con la barretta e azioni a destra. Un conteggio accanto al titolo è un
// numero grande in grassetto (colorato se serve, es. la fascia di urgenza);
// `accanto` resta per le note brevi. Se servirà ad altri moduli si sposta in
// @edg/ui così com'è.
import React from 'react';
import { cn } from '@edg/ui';

interface Props {
  titolo: React.ReactNode;
  /** Il numero accanto al titolo, grande e in grassetto */
  conteggio?: number;
  /** Classe del colore del conteggio (predefinito il testo normale) */
  coloreConteggio?: string;
  /** Accanto al titolo: una nota breve ("stima", "86% nell'ultimo anno") */
  accanto?: React.ReactNode;
  /** A destra (filtri, collegamenti) */
  azioni?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const Riquadro: React.FC<Props> = ({ titolo, conteggio, coloreConteggio, accanto, azioni, className, children }) => (
  <section className={cn('min-w-0 rounded-lg border border-border-thin bg-bg-primary p-5 sm:p-6', className)}>
    <header className='mb-4 flex flex-wrap items-center gap-x-3 gap-y-2'>
      <span aria-hidden className='h-4 w-1 rounded-full bg-action-primary' />
      <h2 className='text-base font-bold text-text-primary'>{titolo}</h2>
      {conteggio !== undefined && (
        <span className={cn('text-xl font-bold leading-none tabular-nums', coloreConteggio ?? 'text-text-primary')}>{conteggio}</span>
      )}
      {accanto && <span className='text-sm text-text-secondary'>{accanto}</span>}
      {azioni && <span className='ml-auto flex flex-wrap items-center gap-2'>{azioni}</span>}
    </header>
    {children}
  </section>
);
