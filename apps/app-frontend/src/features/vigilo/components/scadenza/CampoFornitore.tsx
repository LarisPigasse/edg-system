// src/features/vigilo/components/scadenza/CampoFornitore.tsx
//
// Il fornitore nel modulo Registra: la scelta dalla rubrica e, per chi ha
// vigilo.write, "+ Nuovo fornitore" che apre sotto il riquadro per aggiungerlo
// al volo (F2); appena aggiunto è già scelto. Col riquadro aperto il campo
// occupa tutta la riga della griglia. Il Select di Radix, quando la voce appena
// aggiunta non è ancora fra le sue opzioni, rimanda un valore vuoto: non è mai
// una scelta valida e si ignora.
import React, { useState } from 'react';
import { Plus, Select, cn } from '@edg/ui';

import type { Fornitore } from '../../types/fornitori';
import { NuovoFornitoreRapido } from '../fornitori/NuovoFornitoreRapido';

export const NESSUN_FORNITORE = 'nessuno';

interface Props {
  fornitori: Fornitore[];
  valore: string;
  onValore: (uuid: string) => void;
  /** vigilo.write: si può aggiungere un fornitore */
  puoAggiungere: boolean;
  /** Il fornitore appena creato, da mettere in rubrica */
  onCreato: (f: Fornitore) => void;
}

export const CampoFornitore: React.FC<Props> = ({ fornitori, valore, onValore, puoAggiungere, onCreato }) => {
  const [nuovo, setNuovo] = useState(false);
  return (
    <div className={cn('space-y-2', nuovo && 'sm:col-span-2')}>
      <Select
        label='Fornitore'
        value={valore}
        onValueChange={v => v && onValore(v)}
        options={[{ value: NESSUN_FORNITORE, label: 'Nessuno' }, ...fornitori.map(f => ({ value: f.uuid, label: f.nome }))]}
        helperText={fornitori.length ? undefined : 'Nessun fornitore in rubrica'}
      />
      {puoAggiungere &&
        (nuovo ? (
          <NuovoFornitoreRapido
            onAnnulla={() => setNuovo(false)}
            onCreato={f => {
              onCreato(f);
              onValore(f.uuid);
              setNuovo(false);
            }}
          />
        ) : (
          <button type='button' onClick={() => setNuovo(true)} className='inline-flex items-center gap-1 text-sm font-semibold text-action-primary hover:underline'>
            <Plus className='h-4 w-4' aria-hidden />
            Nuovo fornitore
          </button>
        ))}
    </div>
  );
};
