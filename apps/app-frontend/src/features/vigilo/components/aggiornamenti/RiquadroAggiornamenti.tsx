// src/features/vigilo/components/aggiornamenti/RiquadroAggiornamenti.tsx
//
// In Configurazione, solo se c'è qualcosa da decidere (B10b): quante voci
// della libreria hanno una nuova versione o sono state ritirate, e "Vedi".
import React from 'react';
import { Button, Card, RefreshCw } from '@edg/ui';

import type { ElencoAggiornamenti } from '../../types/aggiornamenti';
import { fraseRiquadro } from '../../utils/aggiornamenti';

export const RiquadroAggiornamenti: React.FC<{ elenco: ElencoAggiornamenti; onApri: () => void }> = ({ elenco, onApri }) => (
  <Card padding='md'>
    <div className='flex flex-wrap items-center gap-4'>
      <span className='rounded-lg bg-bg-secondary p-2 text-action-primary' aria-hidden>
        <RefreshCw className='h-5 w-5' />
      </span>
      <div className='min-w-0 flex-1'>
        <p className='font-medium text-text-primary'>Aggiornamenti della libreria</p>
        <p className='text-sm text-text-secondary'>{fraseRiquadro(elenco.aggiornamenti, elenco.ritiri)}: scegli tu che cosa prendere.</p>
      </div>
      <Button size='sm' onClick={onApri}>
        Vedi
      </Button>
    </div>
  </Card>
);
