// src/core/assistenza/components/StatoAccesso.tsx — In corso · Concluso · Finito a tempo · Chiuso da EDG
import React from 'react';
import { Badge } from '@edg/ui';

import { STATO_ACCESSO } from '../constants';
import type { StatoAccesso as Stato } from '../types';

export const StatoAccesso: React.FC<{ stato: Stato }> = ({ stato }) => {
  const s = STATO_ACCESSO[stato] ?? { testo: stato, variante: 'default' as const };
  return <Badge variant={s.variante}>{s.testo}</Badge>;
};
