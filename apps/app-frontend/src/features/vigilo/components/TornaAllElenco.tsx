// src/features/vigilo/components/TornaAllElenco.tsx
//
// Il ritorno all'elenco dei soggetti nelle testate (scheda e nuovo soggetto):
// un pulsante a icona largo come il refresh, con il tooltip. Non "indietro":
// arrivando da un link esterno (es. un'email) sarebbe ambiguo.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Button, Tooltip } from '@edg/ui';

import type { TipoSoggetto } from '../types/valori';

/** Con il tipo, l'elenco si apre sulla sua scheda */
export const TornaAllElenco: React.FC<{ tipo?: TipoSoggetto | null }> = ({ tipo }) => {
  const navigate = useNavigate();
  return (
    <Tooltip content="Torna all'elenco dei soggetti" side='bottom'>
      <Button variant='secondary' aria-label="Torna all'elenco dei soggetti" onClick={() => navigate(`/vigilo/soggetti${tipo ? `?tipo=${tipo}` : ''}`)}>
        <ArrowLeft className='h-5 w-5' />
      </Button>
    </Tooltip>
  );
};
