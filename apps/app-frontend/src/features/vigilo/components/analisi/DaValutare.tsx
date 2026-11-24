// src/features/vigilo/components/analisi/DaValutare.tsx
//
// I segnali "Da valutare" (2026-11-23, fase D), subito sotto i riquadri: dal
// più grave, ognuno con che cosa si è visto, perché conta e che cosa fare; un
// veicolo si apre con un clic. "Soglie" (vigilo.config) sulla riga del titolo
// apre il pannello delle soglie che fanno scattare i segnali.
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Settings, cn } from '@edg/ui';

import type { Gravita, Segnale } from '../../types/analisi';
import { Scheda } from './Scheda';

const PUNTO: Record<Gravita, string> = { alta: 'bg-red-600', media: 'bg-orange-500', bassa: 'bg-slate-400' };
const NOME: Record<Gravita, string> = { alta: 'Importante', media: 'Da guardare', bassa: 'Da sapere' };

interface Props {
  segnali: Segnale[];
  onSoglie?: () => void;
}

export const DaValutare: React.FC<Props> = ({ segnali, onSoglie }) => (
  <Scheda
    titolo='Da valutare'
    sotto={segnali.length ? `${segnali.length} ${segnali.length === 1 ? 'segnale' : 'segnali'}, dal più importante.` : undefined}
    azioni={
      onSoglie && (
        <Button variant='outline' size='sm' leftIcon={<Settings className='h-4 w-4' />} onClick={onSoglie}>
          Soglie
        </Button>
      )
    }
  >
    {segnali.length === 0 ? (
      <p className='text-sm text-text-secondary'>Nessun segnale: secondo le soglie, va tutto bene.</p>
    ) : (
      <ul className='grid gap-3 lg:grid-cols-2'>
        {segnali.map(s => (
          <li key={s.chiave} className='flex gap-3 rounded-lg bg-bg-secondary p-3'>
            <span className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', PUNTO[s.gravita])} title={NOME[s.gravita]} aria-label={NOME[s.gravita]} />
            <div className='min-w-0 space-y-0.5 text-sm'>
              <p className='font-semibold text-text-primary'>
                {s.soggetto ? (
                  <Link to={`/vigilo/soggetti/${s.soggetto.uuid}`} className='hover:underline'>
                    {s.titolo}
                  </Link>
                ) : (
                  s.titolo
                )}
              </p>
              <p className='text-text-secondary'>{s.dettaglio}</p>
              <p className='text-text-primary'>› {s.azione}</p>
            </div>
          </li>
        ))}
      </ul>
    )}
  </Scheda>
);
