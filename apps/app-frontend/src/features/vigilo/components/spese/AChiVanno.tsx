// src/features/vigilo/components/spese/AChiVanno.tsx
//
// Gli importi dei fornitori esterni: per fornitore (con il suo tipo) o per
// tipo di fornitore, a scelta; i primi 8.
import React, { useState } from 'react';
import { cn } from '@edg/ui';

import { FORNITORI_IN_VISTA } from '../../constants/resoconti';
import type { Spese } from '../../types/resoconti';
import { Riquadro } from '../Riquadro';
import { BarreSpesa } from './BarreSpesa';

type Raggruppa = 'fornitore' | 'tipo';
const SCELTE: [Raggruppa, string][] = [
  ['fornitore', 'Fornitore'],
  ['tipo', 'Tipo'],
];

export const AChiVanno: React.FC<{ dati: Spese }> = ({ dati }) => {
  const [per, setPer] = useState<Raggruppa>('fornitore');
  const voci =
    per === 'fornitore'
      ? dati.perFornitore.map(f => ({ chiave: f.uuid, nome: f.nome, accanto: f.tipo?.nome, valore: f.importi }))
      : dati.perTipoFornitore.map(t => ({ chiave: t.chiave, nome: t.nome, accanto: `${t.n} ${t.n === 1 ? 'registrazione' : 'registrazioni'}`, valore: t.importi }));
  return (
    <Riquadro
      titolo='A chi vanno'
      azioni={
        <span className='flex h-8 items-center rounded-lg border border-border-default p-0.5 text-sm' role='group' aria-label='Raggruppa'>
          {SCELTE.map(([v, etichetta]) => (
            <button
              key={v}
              type='button'
              aria-pressed={per === v}
              onClick={() => setPer(v)}
              className={cn('h-full rounded-md px-2.5 transition-colors', per === v ? 'bg-action-primary text-action-primary-text' : 'text-text-secondary hover:bg-bg-hover')}
            >
              {etichetta}
            </button>
          ))}
        </span>
      }
    >
      <p className='-mt-2 mb-3 text-sm text-text-secondary'>Solo gli importi dei fornitori esterni.</p>
      <BarreSpesa voci={voci.slice(0, FORNITORI_IN_VISTA)} vuoto='Nessun importo di fornitori nel periodo.' />
    </Riquadro>
  );
};
