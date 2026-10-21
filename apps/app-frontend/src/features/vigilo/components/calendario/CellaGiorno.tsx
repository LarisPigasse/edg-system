// src/features/vigilo/components/calendario/CellaGiorno.tsx
//
// Il contenuto di un giorno del calendario (ADR083): da 1024 px etichette
// brevi colorate come le schede di "Da fare" (che cosa, e sotto di chi: le
// celle sono strette), al massimo 3 e poi "+N altre"; più stretto, pallini colorati. Le voci
// stimate dall'uso sono in corsivo. Solo contenuto: la cella è già un
// pulsante (sceglie il giorno).
import React from 'react';
import { cn } from '@edg/ui';

import { FASCE_ASPETTO } from '../../constants/fasce';
import type { VoceCalendario } from '../../types/calendario';
import { fasciaDi } from '../../utils/fasce';

const MASSIMO = 3;

interface Props {
  voci: VoceCalendario[];
  oggi: string;
  /** Giorno fuori dal mese mostrato: tutto più tenue */
  attenuato?: boolean;
}

const testoVoce = (v: VoceCalendario) => `${v.titolo} · ${v.soggetto?.nome ?? 'Promemoria'}`;

export const CellaGiorno: React.FC<Props> = ({ voci, oggi, attenuato }) => {
  if (!voci.length) return null;
  const altre = voci.length - MASSIMO;
  return (
    <span className={cn('flex min-w-0 flex-col gap-0.5', attenuato && 'opacity-60')}>
      {/* da 1024 px: etichette */}
      <span className='hidden min-w-0 flex-col gap-0.5 lg:flex'>
        {voci.slice(0, MASSIMO).map(v => (
          <span
            key={v.uuid}
            title={`${testoVoce(v)}: ${v.testo}`}
            className={cn('flex min-w-0 flex-col rounded px-1.5 py-0.5 leading-tight', FASCE_ASPETTO[fasciaDi(v, oggi)].fondo, v.stimata && 'italic')}
          >
            <span className='truncate text-xs font-semibold'>{v.titolo}</span>
            <span className='truncate text-xs opacity-90'>{v.soggetto?.nome ?? 'Promemoria'}</span>
          </span>
        ))}
        {altre > 0 && <span className='px-1 text-xs text-text-secondary'>+{altre} {altre === 1 ? 'altra' : 'altre'}</span>}
      </span>
      {/* più stretto: pallini */}
      <span className='flex flex-wrap items-center gap-1 lg:hidden' aria-hidden>
        {voci.slice(0, MASSIMO).map(v => (
          <span key={v.uuid} className={cn('h-2 w-2 rounded-full', FASCE_ASPETTO[fasciaDi(v, oggi)].fondo)} />
        ))}
        {altre > 0 && <span className='text-xs leading-none text-text-secondary'>+{altre}</span>}
      </span>
    </span>
  );
};
