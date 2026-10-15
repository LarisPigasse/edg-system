// src/features/vigilo/components/dashboard/SchedaScadenza.tsx
//
// Una cosa da fare come scheda colorata, sul modello delle schede della
// sezione DESIGN: tutte della stessa misura, il colore (quello dei numeri in
// alto) dice la fascia di urgenza, in basso a destra il quando. È un
// pulsante: apre il pannello della scadenza.
import React from 'react';
import { cn } from '@edg/ui';

import { FASCE_ASPETTO, type Fascia } from '../../constants/fasce';
import type { Scadenza } from '../../types/scadenze';

interface Props {
  s: Scadenza;
  fascia: Fascia;
  onApri: () => void;
  /** Al posto del soggetto (nella scheda del soggetto, dove è già scritto) */
  sottotitolo?: string;
}

export const SchedaScadenza: React.FC<Props> = ({ s, fascia, onApri, sottotitolo }) => (
  <button
    type='button'
    onClick={onApri}
    aria-label={`${s.titolo}${s.soggetto ? `, ${s.soggetto.nome}` : ''}: ${s.testo}`}
    className={cn(
      'flex h-32 w-full flex-col justify-between overflow-hidden rounded-lg border p-4 text-left shadow-sm',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2',
      // Al passaggio: si solleva appena e il bordo si accende (il colore del
      // bordo, fermo e al passaggio, lo dà la fascia)
      'transition-all duration-200 motion-safe:hover:-translate-y-0.5 hover:shadow-lg',
      FASCE_ASPETTO[fascia].card
    )}
  >
    <div className='min-w-0'>
      <h3 className='line-clamp-2 text-base font-bold leading-tight'>{s.titolo}</h3>
      <p className='mt-1 truncate text-xs font-medium opacity-90'>
        {sottotitolo ?? (
          <>
            {s.soggetto ? s.soggetto.nome : 'Promemoria'}
            {s.soggetto?.identificativo && <span className='ml-1.5 font-mono'>{s.soggetto.identificativo}</span>}
          </>
        )}
      </p>
    </div>
    <div className='flex justify-end'>
      <span className='max-w-full rounded-lg bg-black/15 px-2 py-1 text-right text-xs font-semibold leading-snug'>
        {s.testo}
      </span>
    </div>
  </button>
);
