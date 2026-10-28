// src/features/vigilo/components/scadenza/FormRespingi.tsx
//
// L'ufficio respinge la segnalazione dell'addetto (B9c): il motivo è
// obbligatorio e arriva a chi l'ha mandata nell'avviso. La scadenza resta
// aperta; nello storico la segnalazione resta come "respinta".
import React, { useState } from 'react';
import { TextArea } from '@edg/ui';

import { PulsantiForm } from './PulsantiForm';

/** Come il servizio (LIMITI_SEGNALAZIONI.motivo) */
const MOTIVO_MASSIMO = 512;

interface Props {
  inCorso: boolean;
  onRespingi: (motivo: string) => void;
  onAnnulla: () => void;
}

export const FormRespingi: React.FC<Props> = ({ inCorso, onRespingi, onAnnulla }) => {
  const [motivo, setMotivo] = useState('');
  const pronto = !!motivo.trim();
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (pronto) onRespingi(motivo.trim());
      }}
      className='space-y-4'
    >
      <TextArea
        label='Motivo'
        value={motivo}
        onChange={e => setMotivo(e.target.value)}
        maxLength={MOTIVO_MASSIMO}
        minRows={2}
        autoResize
        required
        helperText='Lo riceve chi ha mandato la segnalazione: es. manca il timbro sul certificato, ricaricalo e segnala di nuovo.'
      />
      <PulsantiForm pronto={pronto} inCorso={inCorso} onAnnulla={onAnnulla} />
    </form>
  );
};
