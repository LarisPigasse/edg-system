// src/features/vigilo/components/RichiedeAvvio.tsx
//
// Le pagine di Vigilo hanno senso solo dopo la procedura di avvio. Prima:
// chi configura viene portato alla procedura, gli altri leggono che Vigilo
// è in preparazione. I figli possono essere una funzione che riceve il
// profilo (così la home non lo richiede una seconda volta).
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner } from '@edg/ui';

import { useProfiloVigilo } from '../hooks/useProfiloVigilo';
import type { ProfiloVigilo } from '../types/io';
import { InPreparazione } from './InPreparazione';

interface Props {
  children: React.ReactNode | ((profilo: ProfiloVigilo) => React.ReactNode);
}

export const RichiedeAvvio: React.FC<Props> = ({ children }) => {
  const { profilo, errore, caricamento } = useProfiloVigilo();

  if (caricamento) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <Spinner size='md' />
      </div>
    );
  }
  if (profilo?.avviatoIl) return <>{typeof children === 'function' ? children(profilo) : children}</>;
  if (profilo?.capacita.config) return <Navigate to='/vigilo/avvio' replace />;
  return <InPreparazione errore={errore} />;
};
