// src/features/vigilo/components/calendario/ElencoGiorno.tsx
//
// Le scadenze del giorno scelto, come schede colorate (le stesse di "Da
// fare"): un clic apre il pannello della scadenza con le azioni.
import React from 'react';

import type { VoceCalendario } from '../../types/calendario';
import { fasciaDi } from '../../utils/fasce';
import { giornoEsteso } from '../../utils/giorni';
import { SchedaScadenza } from '../dashboard/SchedaScadenza';
import { Riquadro } from '../Riquadro';

interface Props {
  giorno: string;
  voci: VoceCalendario[];
  oggi: string;
  onApri: (uuid: string) => void;
  className?: string;
}

export const ElencoGiorno: React.FC<Props> = ({ giorno, voci, oggi, onApri, className }) => (
  <Riquadro className={className} titolo={giornoEsteso(giorno)} accanto={voci.length > 0 ? `${voci.length} ${voci.length === 1 ? 'scadenza' : 'scadenze'}` : undefined}>
    {voci.length === 0 ? (
      <p className='text-sm text-text-secondary'>Nessuna scadenza aperta in questo giorno.</p>
    ) : (
      <div className='flex flex-col gap-3'>
        {voci.map(v => (
          <SchedaScadenza key={v.uuid} s={v} fascia={fasciaDi(v, oggi)} onApri={() => onApri(v.uuid)} />
        ))}
        {voci.some(v => v.stimata) && (
          <p className='text-xs text-text-secondary'>Le scadenze a contatore sono nel giorno stimato dall&apos;uso medio.</p>
        )}
      </div>
    )}
  </Riquadro>
);
