// src/features/vigilo/components/scadenza/FormSegnala.tsx
//
// "Segnala fatto" dell'addetto (B9c): quando, la lettura del contatore e il
// documento se il controllo li prevede, due righe di note. Importo,
// fornitore e riferimento li completa l'ufficio quando conferma. Pensato per
// il telefono: data di oggi già impostata, pochi campi, uno sotto l'altro.
import React, { useState } from 'react';
import { DatePicker, Input, TextArea } from '@edg/ui';

import { useDocumentiRegistra } from '../../hooks/useDocumentiRegistra';
import type { DatiSegnalazione, DatoRegistrazione, DettaglioScadenza } from '../../types/scadenze';
import { aGiorno, daGiorno, oggiLocale } from '../../utils/giorni';
import { misura } from '../../utils/misure';
import { intero } from '../../utils/numeri';
import { CampoDocumento } from './CampoDocumento';
import { PulsantiForm } from './PulsantiForm';

/** Note dell'addetto, al massimo (come il servizio) */
const NOTE_MASSIME = 1024;

interface Props {
  s: DettaglioScadenza;
  inCorso: boolean;
  onSegnala: (dati: DatiSegnalazione) => void;
  onAnnulla: () => void;
}

export const FormSegnala: React.FC<Props> = ({ s, inCorso, onSegnala, onAnnulla }) => {
  const oggi = oggiLocale();
  const r = s.richieste;
  const c = s.contatore;
  const vede = (k: DatoRegistrazione) => r[k] !== 'nascosto';
  const chiede = (k: DatoRegistrazione) => r[k] === 'obbligatorio';
  const conLettura = !!c && vede('lettura');
  const conDocumento = vede('allegato');
  const doc = useDocumentiRegistra(s.uuid);

  const [eseguitaIl, setEseguitaIl] = useState(oggi);
  const [lettura, setLettura] = useState('');
  const [note, setNote] = useState('');
  const valoreLettura = intero(lettura);

  const pronto =
    !!eseguitaIl &&
    !Number.isNaN(valoreLettura) &&
    !(conLettura && chiede('lettura') && valoreLettura === null) &&
    !(conDocumento && chiede('allegato') && !doc.caricati.length) &&
    !doc.inArrivo.length;

  const invia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pronto) return;
    onSegnala({
      eseguitaIl,
      ...(conLettura ? { lettura: valoreLettura } : {}),
      note: note.trim() || null,
      ...(conDocumento && doc.caricati.length ? { allegati: doc.consegna() } : {}),
    });
  };

  return (
    <form onSubmit={invia} className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <DatePicker
          label='Fatta il'
          value={eseguitaIl ? daGiorno(eseguitaIl) : undefined}
          onChange={d => setEseguitaIl(d ? aGiorno(d) : '')}
          maxDate={daGiorno(oggi)}
          required
        />
        {conLettura && c && (
          <Input
            label={`Lettura (${c.unita})`}
            inputMode='numeric'
            value={lettura}
            onChange={e => setLettura(e.target.value)}
            required={chiede('lettura')}
            error={Number.isNaN(valoreLettura) ? 'Un numero intero' : undefined}
            helperText={c.valore !== null ? `Ultima: ${misura(c.valore, c.unita)}` : 'Quella che leggi adesso'}
          />
        )}
      </div>

      {conDocumento && <CampoDocumento doc={doc} obbligatorio={chiede('allegato')} avvisaSeManca disabilitato={inCorso} />}

      <TextArea
        label='Note per l’ufficio'
        value={note}
        onChange={e => setNote(e.target.value)}
        maxLength={NOTE_MASSIME}
        minRows={1}
        autoResize
        helperText='Dove, da chi, che cosa è stato fatto.'
      />

      <PulsantiForm pronto={pronto} inCorso={inCorso} onAnnulla={onAnnulla} />
    </form>
  );
};
