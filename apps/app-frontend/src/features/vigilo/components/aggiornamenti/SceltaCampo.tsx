// src/features/vigilo/components/aggiornamenti/SceltaCampo.tsx
//
// Un campo di un aggiornamento della libreria (B10b): il tuo valore e quello
// della libreria uno accanto all'altro, si sceglie con un clic (o con le
// frecce: è un gruppo di scelte). "Personalizzato da te" dice perché la
// scelta proposta è il tuo valore.
import React from 'react';
import { Badge, Check, LayoutGrid, cn } from '@edg/ui';

import { IconaLibreria } from '../IconaLibreria';
import type { CampoProposto, Scelta } from '../../types/aggiornamenti';
import { etichettaCampo, testoValore } from '../../utils/aggiornamenti';

interface Props {
  c: CampoProposto;
  scelta: Scelta;
  onScelta: (s: Scelta) => void;
  disabilitato?: boolean;
}

const OPZIONI: { valore: Scelta; titolo: string }[] = [
  { valore: 'mio', titolo: 'Il tuo' },
  { valore: 'libreria', titolo: 'Libreria' },
];

export const SceltaCampo: React.FC<Props> = ({ c, scelta, onScelta, disabilitato }) => {
  const etichetta = etichettaCampo(c.campo);
  const testo = (s: Scelta) => (s === 'mio' ? testoValore(c.campo, c.mio, c.testoMio) : testoValore(c.campo, c.libreria, c.testoLibreria));
  const tasti = (e: React.KeyboardEvent) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      onScelta(scelta === 'mio' ? 'libreria' : 'mio');
    }
  };

  return (
    <fieldset className='space-y-2'>
      <legend className='flex flex-wrap items-center gap-2 text-sm font-medium text-text-primary'>
        {etichetta}
        {c.stato === 'personalizzato' && <Badge variant='warning' size='xs' text='personalizzato da te' className='rounded-lg' />}
      </legend>
      <div role='radiogroup' aria-label={etichetta} className='grid gap-2 sm:grid-cols-2' onKeyDown={tasti}>
        {OPZIONI.map(o => {
          const scelto = scelta === o.valore;
          const valore = o.valore === 'mio' ? c.mio : c.libreria;
          return (
            <button
              key={o.valore}
              type='button'
              role='radio'
              aria-checked={scelto}
              tabIndex={scelto ? 0 : -1}
              disabled={disabilitato}
              onClick={() => onScelta(o.valore)}
              className={cn(
                'relative flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary disabled:cursor-not-allowed disabled:opacity-60',
                scelto ? 'border-action-primary bg-bg-secondary' : 'border-border-default hover:bg-bg-hover'
              )}
            >
              <span className='flex w-full items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary'>
                {o.titolo}
                {scelto && <Check className='h-4 w-4 text-action-primary' aria-hidden />}
              </span>
              <span className='flex items-center gap-2 text-sm text-text-primary'>
                {c.campo === 'icona' && typeof valore === 'string' && <IconaLibreria nome={valore} riserva={LayoutGrid} className='h-4 w-4 shrink-0' />}
                {testo(o.valore)}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
