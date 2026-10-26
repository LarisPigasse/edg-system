// src/features/vigilo/components/avvisi/RigaAvviso.tsx
//
// Un avviso nell'elenco di "I miei avvisi", come nella campanella: titolo
// sopra (in grassetto se da leggere), soggetto e stato sotto, pallino del
// colore della dashboard; a destra quando è nato e, se la scadenza si è
// sistemata, "non serve più". Il clic apre la scadenza con il pannello.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@edg/ui';

import type { TonoAvviso, VoceAvviso } from '../../types/avvisi';
import { dettaglioAvviso, percorsoScadenza, quandoAvviso } from '../../utils/avvisi';

const PALLINO: Record<TonoAvviso, string> = {
  pericolo: 'bg-action-danger',
  attenzione: 'bg-action-warning',
  normale: 'bg-action-primary',
};

export const RigaAvviso: React.FC<{ v: VoceAvviso; base: string; onApri: (v: VoceAvviso) => void }> = ({ v, base, onApri }) => {
  const navigate = useNavigate();
  const daLeggere = v.consegna === 'inviato';
  const superato = v.consegna === 'risolto';
  const apri = () => {
    onApri(v);
    if (v.scadenza) navigate(percorsoScadenza(base, v.scadenza.uuid, v.soggetto?.uuid));
  };

  return (
    <li>
      <button
        type='button'
        onClick={apri}
        className={cn(
          'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-hover focus-visible:bg-bg-hover focus-visible:outline-none',
          daLeggere && 'bg-bg-secondary/60'
        )}
      >
        {/* pallino solo sui da leggere; lo spazio resta, così i testi si allineano */}
        <span aria-hidden className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', daLeggere ? PALLINO[v.tono] : 'bg-transparent')} />
        <span className='min-w-0 flex-1'>
          <span className={cn('block text-sm leading-snug', superato ? 'text-text-secondary' : 'text-text-primary', daLeggere && 'font-semibold')}>
            {v.titolo}
          </span>
          <span className='mt-0.5 block text-sm leading-snug text-text-secondary'>{dettaglioAvviso(v)}</span>
        </span>
        <span className='shrink-0 text-right text-xs leading-snug text-text-secondary'>
          <span className='block whitespace-nowrap tabular-nums'>{quandoAvviso(v.creatoIl)}</span>
          {superato && <span className='mt-0.5 block whitespace-nowrap'>non serve più</span>}
          {daLeggere && <span className='sr-only'>(da leggere)</span>}
        </span>
      </button>
    </li>
  );
};
