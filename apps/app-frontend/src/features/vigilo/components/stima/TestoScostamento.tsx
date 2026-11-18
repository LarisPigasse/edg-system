// src/features/vigilo/components/stima/TestoScostamento.tsx
//
// Lo scostamento fra costo reale e stima (2026-11-18): "+128,00 € (+12,8%)"
// in arancio se è costato più del previsto, in verde se meno.
import React from 'react';
import { cn } from '@edg/ui';

import { COLORE_SOPRA_MEDIA } from '../../constants/costoMezzi';
import type { Scostamento } from '../../types/stima';
import { euroCentesimi } from '../../utils/resoconti';

const segno = (n: number) => (n > 0 ? '+' : '');

export const TestoScostamento: React.FC<{ scostamento: Scostamento | null }> = ({ scostamento: s }) =>
  !s ? (
    <span className='text-text-secondary'>—</span>
  ) : (
    <span className={cn('font-semibold tabular-nums', s.euro > 0 ? COLORE_SOPRA_MEDIA : s.euro < 0 ? 'text-green-700 [.dark_&]:text-green-400' : 'text-text-secondary')}>
      {segno(s.euro)}
      {euroCentesimi(s.euro)}
      {s.percentuale !== null && ` (${segno(s.percentuale)}${s.percentuale.toLocaleString('it-IT')}%)`}
    </span>
  );
