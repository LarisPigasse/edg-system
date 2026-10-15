// src/features/vigilo/components/scadenza/FormLettura.tsx
//
// Una nuova lettura del contatore (km, ore): Vigilo aggiorna la stima di
// quando si arriva alla soglia.
import React, { useState } from 'react';
import { DatePicker, Input } from '@edg/ui';

import type { Contatore } from '../../types/scadenze';
import { aGiorno, daGiorno, giornoBreve, oggiLocale } from '../../utils/giorni';
import { misura, nomeContatore } from '../../utils/misure';
import { intero } from '../../utils/numeri';
import { PulsantiForm } from './PulsantiForm';

interface Props {
  contatore: Contatore;
  inCorso: boolean;
  onLeggi: (dati: { valore: number; lettoIl?: string; note?: string | null }) => void;
  onAnnulla: () => void;
}

export const FormLettura: React.FC<Props> = ({ contatore: c, inCorso, onLeggi, onAnnulla }) => {
  const oggi = oggiLocale();
  const [valore, setValore] = useState('');
  const [lettoIl, setLettoIl] = useState(oggi);
  const [note, setNote] = useState('');
  const n = intero(valore);

  const pronto = n !== null && !Number.isNaN(n) && !!lettoIl;

  const invia = (e: React.FormEvent) => {
    e.preventDefault();
    if (pronto) onLeggi({ valore: n!, lettoIl, note: note.trim() || null });
  };

  const ultima = c.valore !== null ? `Ultima: ${misura(c.valore, c.unita)}${c.lettoIl ? ` il ${giornoBreve(c.lettoIl)}` : ''}` : undefined;

  return (
    <form onSubmit={invia} className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <Input
          label={`${nomeContatore(c)} (${c.unita})`}
          inputMode='numeric'
          value={valore}
          onChange={e => setValore(e.target.value)}
          error={Number.isNaN(n) ? 'Un numero intero' : undefined}
          helperText={ultima}
          required
        />
        <DatePicker
          label='Letto il'
          value={lettoIl ? daGiorno(lettoIl) : undefined}
          onChange={d => setLettoIl(d ? aGiorno(d) : '')}
          maxDate={daGiorno(oggi)}
          required
        />
      </div>
      <Input label='Note' value={note} onChange={e => setNote(e.target.value)} maxLength={256} />
      <PulsantiForm pronto={pronto} inCorso={inCorso} onAnnulla={onAnnulla} />
    </form>
  );
};
