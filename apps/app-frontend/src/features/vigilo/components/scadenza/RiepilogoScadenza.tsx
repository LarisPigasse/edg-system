// src/features/vigilo/components/scadenza/RiepilogoScadenza.tsx
//
// In testa al pannello: lo stato e i dati che servono per decidere.
import React from 'react';

import { StatoScadenza } from '../StatoScadenza';
import type { DettaglioScadenza } from '../../types/scadenze';
import { giornoBreve, giornoEsteso } from '../../utils/giorni';
import { misura, nomeContatore } from '../../utils/misure';

export const RiepilogoScadenza: React.FC<{ s: DettaglioScadenza }> = ({ s }) => {
  const c = s.contatore;
  const righe: [string, React.ReactNode][] = [
    ['Scadenza', s.scadeIl ? giornoEsteso(s.scadeIl) : 'da inserire'],
    ...(s.sogliaUso !== null && c ? [['Soglia', misura(s.sogliaUso, c.unita)] as [string, string]] : []),
    ...(c?.valore != null
      ? [[nomeContatore(c), `${misura(c.valore, c.unita)}${c.lettoIl ? ` · letto il ${giornoBreve(c.lettoIl)}` : ''}`] as [string, string]]
      : []),
    ...(s.stimataIl && c ? [['Soglia stimata', giornoEsteso(s.stimataIl)] as [string, string]] : []),
    ...(s.limiteIl && s.limiteIl !== s.scadeIl ? [['Ultimo giorno utile', giornoEsteso(s.limiteIl)] as [string, string]] : []),
    ['Cadenza', s.impostazioni.frasi.cadenza],
    ...(s.note ? [['Note', s.note] as [string, string]] : []),
  ];
  return (
    <div className='rounded-lg border border-border-default bg-bg-primary px-4 py-3'>
      <StatoScadenza stato={s.stato} testo={s.testo} className='whitespace-normal text-lg' />
      <dl className='mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm'>
        {righe.map(([etichetta, valore]) => (
          <React.Fragment key={etichetta}>
            <dt className='text-text-secondary'>{etichetta}</dt>
            <dd className='text-text-primary first-letter:uppercase'>{valore}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
};
