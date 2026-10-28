// src/features/vigilo/components/dashboard/SchedaScadenza.tsx
//
// Una cosa da fare come scheda colorata, sul modello delle schede della
// sezione DESIGN: tutte della stessa misura, il colore (quello dei numeri in
// alto) dice la fascia di urgenza, in basso a destra il quando. È un
// pulsante: apre il pannello della scadenza. In basso a sinistra, se c'è,
// la segnalazione dell'addetto da confermare (B9c).
import React from 'react';
import { Hourglass, cn } from '@edg/ui';

import { FASCE_ASPETTO, type Fascia } from '../../constants/fasce';
import type { Scadenza } from '../../types/scadenze';

interface Props {
  s: Scadenza;
  fascia: Fascia;
  onApri: () => void;
  /** Al posto del soggetto (nella scheda del soggetto, dove è già scritto) */
  sottotitolo?: string;
  /** La segnalazione in attesa: etichetta breve e spiegazione (per l'ufficio da confermare, per l'addetto in attesa) */
  segnalata?: { etichetta: string; spiegazione: string };
}

const SEGNALATA_UFFICIO = { etichetta: 'Segnalata', spiegazione: 'Segnalata fatta dall’addetto: da confermare' };

export const SchedaScadenza: React.FC<Props> = ({ s, fascia, onApri, sottotitolo, segnalata = SEGNALATA_UFFICIO }) => (
  <button
    type='button'
    onClick={onApri}
    aria-label={`${s.titolo}${s.soggetto ? `, ${s.soggetto.nome}` : ''}: ${s.testo}${s.segnalata ? ` (${segnalata.spiegazione.toLowerCase()})` : ''}`}
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
    <div className='flex items-end justify-between gap-2'>
      {s.segnalata ? (
        <span title={segnalata.spiegazione} className='inline-flex shrink-0 items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-gray-900'>
          <Hourglass className='h-3.5 w-3.5' aria-hidden />
          {segnalata.etichetta}
        </span>
      ) : (
        <span />
      )}
      <span className={cn('min-w-0 rounded-lg bg-black/15 px-2 py-1 text-right text-xs font-semibold leading-snug', s.segnalata && 'truncate whitespace-nowrap')}>
        {s.testo}
      </span>
    </div>
  </button>
);
