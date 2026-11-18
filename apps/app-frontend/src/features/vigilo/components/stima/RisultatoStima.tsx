// src/features/vigilo/components/stima/RisultatoStima.tsx
//
// Il risultato della nuova stima (2026-11-17, fase 2): la scomposizione
// (ScomposizioneStima) che si aggiorna mentre si scrive, Salva (fase 3) e il PDF.
import React from 'react';
import { Alert, Button, FileText, cn } from '@edg/ui';

import type { CalcoloStima } from '../../types/stima';
import { Riquadro } from '../Riquadro';
import { ScomposizioneStima } from './ScomposizioneStima';

interface Props {
  calcolo: CalcoloStima | null;
  inCorso: boolean;
  errore: string | null;
  onPdf: () => void;
  onSalva: () => void;
  salvando: boolean;
}

export const RisultatoStima: React.FC<Props> = ({ calcolo: c, inCorso, errore, onPdf, onSalva, salvando }) => (
  <Riquadro
    titolo='Stima'
    accanto='approssimata'
    azioni={
      <div className='flex items-center gap-2'>
        <Button variant='outline' size='sm' leftIcon={<FileText className='h-4 w-4' />} onClick={onPdf} disabled={!c}>
          PDF
        </Button>
        <Button size='sm' onClick={onSalva} disabled={!c || inCorso} isLoading={salvando} loadingText='Salvo…'>
          Salva
        </Button>
      </div>
    }
  >
    {errore && (
      <Alert variant='danger' title='Stima non calcolata' className='mb-3'>
        {errore}
      </Alert>
    )}
    {!c ? (
      <p className='rounded-lg border border-dashed border-border-default p-8 text-center text-sm text-text-secondary'>
        Scrivi i km dell’andata (o le ore di lavoro) per vedere la stima.
      </p>
    ) : (
      <div className={cn('transition-opacity', inCorso && 'opacity-60')}>
        <ScomposizioneStima calcolo={c} />
      </div>
    )}
  </Riquadro>
);
