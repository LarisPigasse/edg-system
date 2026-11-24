// src/features/vigilo/components/stima/TestoMargine.tsx
//
// Il margine di un servizio (2026-11-23): "+200,00 € (16,7%)" in verde se il
// prezzo copre il costo, in arancio se no; con `base` dice se è sul costo
// reale o sulla stima.
import React from 'react';
import { cn } from '@edg/ui';

import { COLORE_SOPRA_MEDIA } from '../../constants/costoMezzi';
import type { Margine } from '../../types/stima';
import { euroCentesimi } from '../../utils/resoconti';

const segno = (n: number) => (n > 0 ? '+' : '');

export const TestoMargine: React.FC<{ margine: Margine | null; conBase?: boolean }> = ({ margine: m, conBase }) =>
  !m ? (
    <span className='text-text-secondary'>—</span>
  ) : (
    <span className={cn('font-semibold tabular-nums', m.euro < 0 ? COLORE_SOPRA_MEDIA : m.euro > 0 ? 'text-green-700 [.dark_&]:text-green-400' : 'text-text-secondary')}>
      {segno(m.euro)}
      {euroCentesimi(m.euro)}
      {m.percentuale !== null && ` (${m.percentuale.toLocaleString('it-IT')}%)`}
      {conBase && <span className='font-normal text-text-secondary'>{m.base === 'reale' ? ' sul costo reale' : ' sulla stima'}</span>}
    </span>
  );
