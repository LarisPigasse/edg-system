// src/features/vigilo/components/addetto/GruppoScadenze.tsx
//
// Un gruppo di "Le mie scadenze" (B9b): titolo (Mie, o il mezzo con la targa)
// e le schede colorate della dashboard, grandi e facili da toccare; su
// telefono una per riga.
import React from 'react';

import { NATURE_TESTO } from '../../constants/nature';
import type { Scadenza } from '../../types/scadenze';
import { fasciaDi } from '../../utils/fasce';
import { oggiLocale } from '../../utils/giorni';
import { SchedaScadenza } from '../dashboard/SchedaScadenza';

const SEGNALATA_ADDETTO = { etichetta: 'In attesa', spiegazione: 'Segnalata fatta: in attesa di conferma dall’ufficio' };

interface Props {
  titolo: React.ReactNode;
  voci: Scadenza[];
  onApri: (uuid: string) => void;
}

export const GruppoScadenze: React.FC<Props> = ({ titolo, voci, onApri }) => {
  const oggi = oggiLocale();
  return (
    <section className='space-y-3'>
      <h2 className='text-sm font-semibold uppercase tracking-wide text-text-secondary'>{titolo}</h2>
      <div className='grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3'>
        {voci.map(s => (
          <SchedaScadenza
            key={s.uuid}
            s={s}
            fascia={fasciaDi(s, oggi)}
            onApri={() => onApri(s.uuid)}
            sottotitolo={s.controllo ? NATURE_TESTO[s.controllo.natura] : undefined}
            segnalata={SEGNALATA_ADDETTO}
          />
        ))}
      </div>
    </section>
  );
};
