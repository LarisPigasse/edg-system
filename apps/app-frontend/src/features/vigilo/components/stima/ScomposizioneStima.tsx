// src/features/vigilo/components/stima/ScomposizioneStima.tsx
//
// La scomposizione di una stima (2026-11-18): il totale in grande con il
// costo per km e per ora di servizio, la sintesi, le voci con il loro "come
// si calcola" e gli avvisi sui dati mancanti. Uguale nella nuova stima e nel
// dettaglio di una stima salvata (che si rilegge con i valori di allora).
import React from 'react';
import { Alert } from '@edg/ui';

import type { CalcoloStima } from '../../types/stima';
import { righeStima, sintesiStima } from '../../utils/pdfStima';
import { euroCentesimi } from '../../utils/resoconti';

export const ScomposizioneStima: React.FC<{ calcolo: Pick<CalcoloStima, 'usati' | 'risultato'> }> = ({ calcolo: c }) => (
  <div className='space-y-4'>
    <div>
      <p className='text-3xl font-bold tabular-nums text-action-primary'>{euroCentesimi(c.risultato.totale)}</p>
      <p className='text-sm text-text-secondary'>
        {[c.risultato.perKm !== null && `${euroCentesimi(c.risultato.perKm)} per km`, c.risultato.perOra !== null && `${euroCentesimi(c.risultato.perOra)} per ora di servizio`]
          .filter(Boolean)
          .join(' · ')}
      </p>
      <p className='mt-1 text-xs text-text-secondary'>{sintesiStima(c)}</p>
    </div>

    <dl className='divide-y divide-border-default border-y border-border-default'>
      {righeStima(c, c.risultato.kmTotali !== null ? 'Conducente' : 'Operatore').map(r => (
        <div key={r.chiave} className='flex items-start gap-3 py-2'>
          <div className='min-w-0 flex-1'>
            <dt className='text-sm font-medium'>{r.voce}</dt>
            <dd className='text-xs text-text-secondary'>{r.dettaglio}</dd>
          </div>
          <span className='text-sm font-semibold tabular-nums'>{euroCentesimi(r.importo)}</span>
        </div>
      ))}
      <div className='flex items-center justify-between py-2'>
        <dt className='text-sm font-semibold'>Totale</dt>
        <span className='text-sm font-bold tabular-nums'>{euroCentesimi(c.risultato.totale)}</span>
      </div>
    </dl>

    {c.risultato.avvisi.length > 0 && (
      <Alert variant='warning' title='Dati mancanti'>
        <ul className='list-disc space-y-0.5 pl-4'>
          {c.risultato.avvisi.map(a => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Alert>
    )}
  </div>
);
