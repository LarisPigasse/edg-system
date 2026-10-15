// src/features/vigilo/components/soggetti/SituazioneSoggetto.tsx
//
// Come sta un soggetto: lo stato peggiore fra le sue scadenze aperte, nel
// colore della dashboard, e quante sono.
import React from 'react';

import { StatoScadenza } from '../StatoScadenza';
import type { Soggetto } from '../../types/soggetti';

export const SituazioneSoggetto: React.FC<{ scadenze: Soggetto['scadenze'] }> = ({ scadenze: s }) =>
  !s || s.aperte === 0 ? (
    <span className='text-text-secondary'>Nessuna scadenza</span>
  ) : (
    <span className='whitespace-nowrap'>
      <StatoScadenza stato={s.statoPeggiore ?? 'in-regola'} />
      <span className='text-text-secondary'>
        {' '}
        · {s.aperte} {s.aperte === 1 ? 'scadenza' : 'scadenze'}
      </span>
    </span>
  );
