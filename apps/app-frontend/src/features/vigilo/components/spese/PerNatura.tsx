// src/features/vigilo/components/spese/PerNatura.tsx — la spesa per natura (le riparazioni in rosso)
import React from 'react';

import { NATURE_TESTO } from '../../constants/nature';
import type { Spese } from '../../types/resoconti';
import { Riquadro } from '../Riquadro';
import { BarreSpesa } from './BarreSpesa';

export const PerNatura: React.FC<{ dati: Spese }> = ({ dati }) => (
  <Riquadro titolo='Per natura'>
    <BarreSpesa
      vuoto='Nessuna spesa nel periodo.'
      voci={dati.perNatura.map(n => ({
        chiave: n.natura,
        nome: NATURE_TESTO[n.natura],
        accanto: `${n.n} ${n.n === 1 ? 'intervento' : 'interventi'}`,
        valore: n.spesa,
        colore: n.natura === 'riparazione' ? 'bg-red-500' : undefined,
      }))}
    />
  </Riquadro>
);
