// src/features/vigilo/components/scadenza/FormCompleta.tsx
//
// Una scadenza "da completare" non ha ancora la data (o la soglia, se è a
// contatore): basta inserirla perché Vigilo inizi a seguirla.
import React, { useState } from 'react';
import { DatePicker, Input } from '@edg/ui';

import type { DettaglioScadenza } from '../../types/scadenze';
import { aGiorno, daGiorno } from '../../utils/giorni';
import { intero } from '../../utils/numeri';
import { PulsantiForm } from './PulsantiForm';

interface Props {
  s: DettaglioScadenza;
  inCorso: boolean;
  onCompleta: (dati: { scadeIl?: string | null; sogliaUso?: number | null }) => void;
  onAnnulla: () => void;
}

export const FormCompleta: React.FC<Props> = ({ s, inCorso, onCompleta, onAnnulla }) => {
  const c = s.contatore;
  const [scadeIl, setScadeIl] = useState(s.scadeIl ?? '');
  const [soglia, setSoglia] = useState(s.sogliaUso !== null ? String(s.sogliaUso) : '');
  const valoreSoglia = intero(soglia);

  const pronto = !Number.isNaN(valoreSoglia) && (!!scadeIl || valoreSoglia !== null);

  const invia = (e: React.FormEvent) => {
    e.preventDefault();
    if (pronto) onCompleta({ ...(scadeIl ? { scadeIl } : {}), ...(c && valoreSoglia !== null ? { sogliaUso: valoreSoglia } : {}) });
  };

  return (
    <form onSubmit={invia} className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <DatePicker label='Scade il' value={scadeIl ? daGiorno(scadeIl) : undefined} onChange={d => setScadeIl(d ? aGiorno(d) : '')} />
        {c && (
          <Input
            label={`Oppure a (${c.unita})`}
            inputMode='numeric'
            value={soglia}
            onChange={e => setSoglia(e.target.value)}
            error={Number.isNaN(valoreSoglia) ? 'Un numero intero' : undefined}
          />
        )}
      </div>
      <PulsantiForm pronto={pronto} inCorso={inCorso} onAnnulla={onAnnulla} />
    </form>
  );
};
