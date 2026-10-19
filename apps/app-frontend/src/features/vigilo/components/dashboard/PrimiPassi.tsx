// src/features/vigilo/components/dashboard/PrimiPassi.tsx
//
// La dashboard prima del primo soggetto: niente numeri a zero né "tutto in
// regola" (non c'è ancora niente da sorvegliare), ma il passo successivo.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@edg/ui';

import type { Capacita } from '../../types/io';
import { Riquadro } from '../Riquadro';

export const PrimiPassi: React.FC<{ capacita: Capacita }> = ({ capacita }) => {
  const navigate = useNavigate();

  return (
    <Riquadro titolo='Per cominciare'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <p className='max-w-2xl text-sm text-text-secondary'>
          Vigilo non sorveglia ancora nessun soggetto. Inserisci i veicoli, le persone, le sedi e tutto ciò che ha
          scadenze: per ognuno Vigilo crea da solo le scadenze dei controlli della sua categoria.
        </p>
        <div className='flex flex-wrap items-center gap-3'>
          {capacita.config && (
            <Button variant='secondary' onClick={() => navigate('/vigilo/configurazione')}>
              Vedi i controlli
            </Button>
          )}
          {capacita.write && <Button onClick={() => navigate('/vigilo/soggetti/nuovo')}>Aggiungi il primo soggetto</Button>}
        </div>
      </div>
    </Riquadro>
  );
};
