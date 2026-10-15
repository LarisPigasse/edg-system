// src/features/vigilo/components/avvio/PassoSettori.tsx
//
// Passo 1: i modelli di settore come schede da spuntare (scelta multipla).
import React from 'react';
import { Badge, Check, LayoutGrid, cn } from '@edg/ui';

import { IconaLibreria } from '../IconaLibreria';
import { TIPI } from '../../constants/tipiSoggetto';
import type { ModelloSettore } from '../../types/avvio';
import { TIPI_SOGGETTO } from '../../types/valori';

interface Props {
  modelli: ModelloSettore[];
  scelti: ReadonlySet<string>;
  onCommuta: (chiave: string) => void;
}

const SchedaModello: React.FC<{ m: ModelloSettore; scelto: boolean; onCommuta: () => void }> = ({ m, scelto, onCommuta }) => (
  <button
    type='button'
    aria-pressed={scelto}
    onClick={onCommuta}
    className={cn(
      'relative flex h-full flex-col gap-3 rounded-lg border-2 bg-bg-primary p-5 text-left transition-all',
      'hover:shadow-themed-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary',
      scelto ? 'border-action-primary' : 'border-border-default hover:border-border-strong'
    )}
  >
    <span
      aria-hidden
      className={cn(
        'absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
        scelto ? 'border-action-primary bg-action-primary text-action-primary-text' : 'border-border-default'
      )}
    >
      {scelto && <Check className='h-3.5 w-3.5' />}
    </span>
    <span className='flex items-center gap-3 pr-8'>
      <span className={cn('rounded-lg p-2', scelto ? 'bg-bg-selected text-text-link' : 'bg-bg-secondary text-text-secondary')}>
        <IconaLibreria nome={m.icona} riserva={LayoutGrid} className='h-6 w-6' />
      </span>
      <span className='text-base font-semibold text-text-primary'>{m.nome}</span>
    </span>
    {m.descrizione && <span className='text-sm text-text-secondary'>{m.descrizione}</span>}
    <span className='mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-text-secondary'>
      <span className='font-medium text-text-primary'>{m.controlli} controlli</span>
      {TIPI_SOGGETTO.filter(t => m.controlliPerTipo[t]).map(t => {
        const Icona = TIPI[t].icona;
        return (
          <span key={t} className='inline-flex items-center gap-1' title={TIPI[t].plurale}>
            <Icona className='h-3.5 w-3.5' aria-hidden />
            {m.controlliPerTipo[t]}
            <span className='sr-only'>{TIPI[t].plurale}</span>
          </span>
        );
      })}
      {m.applicato && <Badge variant='success' text='già applicato' />}
    </span>
  </button>
);

export const PassoSettori: React.FC<Props> = ({ modelli, scelti, onCommuta }) => (
  <section className='space-y-4'>
    <div>
      <h2 className='text-lg font-semibold text-text-primary'>In quali settori lavora l'azienda?</h2>
      <p className='text-sm text-text-secondary'>
        Ogni settore porta i controlli che EDG conosce, con cadenze e riferimenti normativi. Puoi sceglierne più di uno:
        i controlli in comune compaiono una volta sola.
      </p>
    </div>
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5'>
      {modelli.map(m => (
        <SchedaModello key={m.chiave} m={m} scelto={scelti.has(m.chiave)} onCommuta={() => onCommuta(m.chiave)} />
      ))}
    </div>
  </section>
);
