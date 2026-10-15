// src/features/vigilo/components/scadenza/PulsantiForm.tsx
//
// In fondo a ogni modulo del pannello: annulla (chiude) e conferma. Sempre
// "Conferma", per non confonderlo con il nome dell'azione scelta sopra.
import React from 'react';
import { Button } from '@edg/ui';

interface Props {
  pronto: boolean;
  inCorso: boolean;
  onAnnulla: () => void;
}

export const PulsantiForm: React.FC<Props> = ({ pronto, inCorso, onAnnulla }) => (
  <div className='flex justify-end gap-2 pt-1'>
    <Button type='button' variant='secondary' onClick={onAnnulla} disabled={inCorso}>
      Annulla
    </Button>
    <Button type='submit' disabled={!pronto || inCorso} isLoading={inCorso}>
      Conferma
    </Button>
  </div>
);
