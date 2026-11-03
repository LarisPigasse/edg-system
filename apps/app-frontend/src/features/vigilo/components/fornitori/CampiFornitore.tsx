// src/features/vigilo/components/fornitori/CampiFornitore.tsx
//
// I campi di un fornitore: nome e tipo (obbligatori), telefono, email,
// referente, indirizzo e note. Con `essenziali` solo nome, tipo e telefono:
// per aggiungere un fornitore al volo dal modulo Registra (F2). L'errore
// dell'email compare quando si esce dal campo, non mentre si scrive.
import React, { useState } from 'react';
import { Input, Select, TextArea } from '@edg/ui';

import { LIMITI_FORNITORE } from '../../constants/fornitori';
import type { TipoFornitore, TipoFornitoreRif } from '../../types/fornitori';
import { erroreEmail, opzioniTipo, type ValoriFornitore } from '../../utils/formFornitore';

interface Props {
  valori: ValoriFornitore;
  onValori: (v: ValoriFornitore) => void;
  tipi: TipoFornitore[];
  /** Il tipo che il fornitore ha già (resta fra le scelte anche se disattivato) */
  tipoAttuale?: TipoFornitoreRif | null;
  essenziali?: boolean;
}

export const CampiFornitore: React.FC<Props> = ({ valori, onValori, tipi, tipoAttuale, essenziali = false }) => {
  const campo = (k: keyof ValoriFornitore) => (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onValori({ ...valori, [k]: ev.target.value });
  const opzioni = opzioniTipo(tipi, tipoAttuale);
  const [emailToccata, setEmailToccata] = useState(false);
  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <Input label='Nome' required value={valori.nome} onChange={campo('nome')} maxLength={LIMITI_FORNITORE.nome} autoFocus />
      <Select
        label='Tipo'
        value={valori.tipo ?? ''}
        onValueChange={v => onValori({ ...valori, tipo: v || null })}
        options={opzioni}
        placeholder='Scegli il tipo'
        helperText={opzioni.length ? undefined : 'Nessun tipo disponibile: riprova più tardi'}
      />
      <Input label='Telefono' type='tel' value={valori.telefono} onChange={campo('telefono')} maxLength={LIMITI_FORNITORE.telefono} />
      {!essenziali && (
        <>
          <Input
            label='Email'
            type='email'
            value={valori.email}
            onChange={campo('email')}
            onBlur={() => setEmailToccata(true)}
            maxLength={LIMITI_FORNITORE.email}
            error={emailToccata ? erroreEmail(valori.email) : undefined}
          />
          <Input label='Referente' value={valori.referente} onChange={campo('referente')} maxLength={LIMITI_FORNITORE.referente} />
          <Input label='Indirizzo' value={valori.indirizzo} onChange={campo('indirizzo')} maxLength={LIMITI_FORNITORE.indirizzo} />
          <div className='sm:col-span-2'>
            <TextArea label='Note' value={valori.note} onChange={campo('note')} maxLength={LIMITI_FORNITORE.note} autoResize minRows={3} />
          </div>
        </>
      )}
    </div>
  );
};
