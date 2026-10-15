// src/features/vigilo/components/DescrizioneControllo.tsx
//
// Come si legge un controllo, ovunque compaia (procedura di avvio,
// configurazione): nome con i suoi segni, la cadenza in parole e una riga di
// dettagli. Solo elementi in linea: può stare dentro un'etichetta.
import React from 'react';
import { Badge } from '@edg/ui';

import type { Frasi, Natura, Rinnovo } from '../types/valori';
import { NATURE_TESTO } from '../constants/nature';

interface Props {
  nome: string;
  natura: Natura;
  rinnovo: Rinnovo;
  frasi: Frasi;
  /** Dopo avvisi e tolleranza (categorie, riferimento normativo…); i vuoti si saltano */
  dettagli?: (string | null | undefined)[];
  /** Segni in più accanto al nome (es. "già presente", "disattivato") */
  segni?: React.ReactNode;
  /** Riga finale (es. che cosa includere per poterlo scegliere) */
  nota?: React.ReactNode;
  attenuato?: boolean;
}

export const DescrizioneControllo: React.FC<Props> = ({ nome, natura, rinnovo, frasi, dettagli = [], segni, nota, attenuato }) => (
  <span className={attenuato ? 'block space-y-1 opacity-60' : 'block space-y-1'}>
    <span className='flex flex-wrap items-center gap-2'>
      <span className='font-medium text-text-primary'>{nome}</span>
      <Badge text={NATURE_TESTO[natura]} />
      {rinnovo === 'tacito' && <Badge variant='info' text='rinnovo tacito' />}
      {segni}
    </span>
    <span className='block text-sm text-text-primary'>{frasi.cadenza}</span>
    <span className='block text-xs text-text-secondary'>
      {[frasi.preavvisi, frasi.tolleranza, ...dettagli].filter(Boolean).join(' · ')}
    </span>
    {nota}
  </span>
);
