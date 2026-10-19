// src/features/vigilo/components/configurazione/Impostazioni.tsx
//
// In breve: settori applicati e predefiniti per i controlli nuovi.
import React from 'react';
import { Card } from '@edg/ui';

import type { StatoAvvio } from '../../types/avvio';

/** "32, 8 e 1": come le frasi del servizio */
const elenco = (xs: number[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} e ${xs[xs.length - 1]}`);

/** Dal più lontano; il nome si accorda con l'ultimo numero: "a 32, 8 e 1 giorno" */
const giorni = (g: number[]) => {
  const ordinati = [...g].sort((a, b) => b - a);
  return ordinati.length
    ? `avvisi a ${elenco(ordinati)} ${ordinati[ordinati.length - 1] === 1 ? 'giorno' : 'giorni'}`
    : 'nessun preavviso';
};

export const Impostazioni: React.FC<{ stato: StatoAvvio }> = ({ stato }) => {
  const applicati = stato.modelli.filter(m => m.applicato).map(m => m.nome);
  const t = stato.predefiniti.tolleranza.giorni;
  return (
    <Card padding='md'>
      <dl className='grid gap-x-8 gap-y-2 text-sm sm:grid-cols-[auto_1fr]'>
        <dt className='font-medium text-text-label'>Settori applicati</dt>
        <dd className='text-text-primary'>{applicati.length ? applicati.join(', ') : 'nessuno (partito da zero)'}</dd>
        <dt className='font-medium text-text-label'>Per i controlli nuovi</dt>
        <dd className='text-text-primary'>
          {giorni(stato.predefiniti.preavvisi.giorni)} · {t ? `tolleranza ${t} ${t === 1 ? 'giorno' : 'giorni'}` : 'nessuna tolleranza'}
        </dd>
      </dl>
    </Card>
  );
};
