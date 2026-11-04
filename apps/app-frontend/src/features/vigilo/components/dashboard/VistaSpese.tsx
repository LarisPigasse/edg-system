// src/features/vigilo/components/dashboard/VistaSpese.tsx
//
// La seconda vista della Dashboard: "quanto spendo, quanto consumo" (B10c,
// anteprima approvata). Dalle registrazioni eseguite e confermate: filtri,
// quattro riquadri, poi due colonne indipendenti come in Da fare: a sinistra
// mese per mese e per soggetto, a destra per natura e a chi vanno. Solo per
// chi ha vigilo.costi (la Dashboard non offre la vista agli altri). Con un
// periodo personalizzato incompleto si vede solo l'avviso, non i numeri di
// prima.
import React from 'react';
import { Alert } from '@edg/ui';

import { useSpese } from '../../hooks/useSpese';
import type { RiferimentoSoggetto } from '../../types/scadenze';
import { AChiVanno } from '../spese/AChiVanno';
import { FiltriSpese } from '../spese/FiltriSpese';
import { MesePerMese } from '../spese/MesePerMese';
import { PerNatura } from '../spese/PerNatura';
import { PerSoggetto } from '../spese/PerSoggetto';
import { RiquadriSpese } from '../spese/RiquadriSpese';

export const VistaSpese: React.FC<{ testo: string; sedi: RiferimentoSoggetto[] }> = ({ testo, sedi }) => {
  const s = useSpese(testo);
  return (
    <div className='space-y-6'>
      <FiltriSpese s={s} sedi={sedi} />
      {s.avvisoDate && (
        <Alert variant='info' title='Periodo da completare'>
          {s.avvisoDate}
        </Alert>
      )}
      {s.errore && (
        <Alert variant='danger' title='Impossibile leggere le spese'>
          {s.errore}
        </Alert>
      )}
      {!s.avvisoDate && <RiquadriSpese dati={s.dati} />}
      {s.dati && !s.avvisoDate && (
        <div className='flex flex-wrap items-start gap-4'>
          <div className='flex min-w-0 flex-[3_1_40rem] flex-col gap-4'>
            <MesePerMese dati={s.dati} />
            <PerSoggetto dati={s.dati} />
          </div>
          <div className='flex min-w-0 flex-[2_1_22rem] flex-col gap-4'>
            <PerNatura dati={s.dati} />
            <AChiVanno dati={s.dati} />
          </div>
        </div>
      )}
    </div>
  );
};
