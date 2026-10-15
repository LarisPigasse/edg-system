// src/features/vigilo/components/scadenza/FormRinvia.tsx
//
// Sposta la data, sempre con un motivo (resta nello storico della scadenza).
import React, { useState } from 'react';
import { DatePicker, Input, TextArea } from '@edg/ui';

import type { DatiRinvio, DettaglioScadenza } from '../../types/scadenze';
import { aGiorno, daGiorno } from '../../utils/giorni';
import { PulsantiForm } from './PulsantiForm';

interface Props {
  s: DettaglioScadenza;
  inCorso: boolean;
  onRinvia: (dati: DatiRinvio) => void;
  onAnnulla: () => void;
}

export const FormRinvia: React.FC<Props> = ({ s, inCorso, onRinvia, onAnnulla }) => {
  const [dataNuova, setDataNuova] = useState('');
  const [motivo, setMotivo] = useState('');
  const [note, setNote] = useState('');

  const uguale = !!dataNuova && dataNuova === s.scadeIl;
  const pronto = !!dataNuova && !uguale && !!motivo.trim();

  const invia = (e: React.FormEvent) => {
    e.preventDefault();
    if (pronto) onRinvia({ dataNuova, motivo: motivo.trim(), note: note.trim() || null });
  };

  return (
    <form onSubmit={invia} className='space-y-4'>
      <DatePicker
        label='Nuova data'
        value={dataNuova ? daGiorno(dataNuova) : undefined}
        onChange={d => setDataNuova(d ? aGiorno(d) : '')}
        error={uguale ? 'È la data attuale' : undefined}
        required
      />
      <Input
        label='Motivo'
        value={motivo}
        onChange={e => setMotivo(e.target.value)}
        maxLength={512}
        required
        helperText="Es. officina disponibile solo dal 20, proroga dell'ente…"
      />
      <TextArea label='Note' value={note} onChange={e => setNote(e.target.value)} maxLength={4096} minRows={1} />
      <PulsantiForm pronto={pronto} inCorso={inCorso} onAnnulla={onAnnulla} />
    </form>
  );
};
