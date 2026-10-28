// src/features/vigilo/components/soggetto/CartaContatore.tsx
//
// Un contatore (km, ore): il valore, quando è stato letto, l'uso medio,
// l'andamento delle ultime 32 letture e le più recenti, con la nuova lettura
// a portata di mano. Le letture minori di una precedente sono segnalate.
// Una lettura sbagliata si corregge eliminandola (puoCorreggere: l'ufficio le
// manuali, l'addetto solo le sue, B9b), con conferma.
import React, { useState } from 'react';
import { Button, ConfirmModal, Tooltip as Suggerimento, Trash2 } from '@edg/ui';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { useContatore } from '../../hooks/useContatore';
import type { Contatore } from '../../types/scadenze';
import type { Lettura } from '../../types/soggetti';
import { giornoBreve } from '../../utils/giorni';
import { misura, nomeContatore } from '../../utils/misure';
import { Riquadro } from '../Riquadro';
import { FormLettura } from '../scadenza/FormLettura';

const VISIBILI = 8;

interface Props {
  c: Contatore;
  puoScrivere: boolean;
  /** Quali letture si possono correggere (eliminare); assente = nessuna */
  puoCorreggere?: (l: Lettura) => boolean;
  onCambiato: () => void;
}

export const CartaContatore: React.FC<Props> = ({ c, puoScrivere, puoCorreggere, onCambiato }) => {
  const k = useContatore(c, onCambiato);
  const [nuova, setNuova] = useState(false);
  const [daCorreggere, setDaCorreggere] = useState<Lettura | null>(null);
  const andamento = [...k.letture].reverse().map(l => ({ giorno: giornoBreve(l.lettoIl), valore: l.valore }));

  return (
    <Riquadro
      titolo={nomeContatore(c)}
      azioni={
        puoScrivere && !nuova ? (
          <Button size='sm' variant='secondary' onClick={() => setNuova(true)}>
            Nuova lettura
          </Button>
        ) : undefined
      }
    >
      <div className='space-y-4'>
        <div className='flex flex-wrap items-end gap-x-8 gap-y-2'>
          <p className='text-3xl font-bold tabular-nums text-text-primary'>{c.valore !== null ? misura(c.valore, c.unita) : '—'}</p>
          <p className='text-sm text-text-secondary'>
            {c.lettoIl ? `Letto il ${giornoBreve(c.lettoIl)}` : 'Mai letto'}
            {c.usoGiornaliero ? ` · in media ${misura(Math.round(c.usoGiornaliero), c.unita)} al giorno` : ''}
          </p>
        </div>

        {nuova && (
          <div className='rounded-lg bg-bg-secondary p-4'>
            <FormLettura
              contatore={c}
              inCorso={k.inCorso}
              onLeggi={async dati => {
                if (await k.leggi(dati)) setNuova(false);
              }}
              onAnnulla={() => setNuova(false)}
            />
          </div>
        )}

        {andamento.length >= 2 && (
          <div className='h-40' role='img' aria-label={`Andamento delle ultime ${andamento.length} letture`}>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={andamento} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid vertical={false} stroke='var(--color-border-thin)' />
                <XAxis dataKey='giorno' tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} minTickGap={32} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                  tickFormatter={v => Number(v).toLocaleString('it-IT')}
                />
                <Tooltip
                  formatter={v => [misura(Number(v), c.unita), 'Lettura']}
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border-default)', fontSize: 12 }}
                />
                <Line type='monotone' dataKey='valore' stroke='var(--color-action-primary)' strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {k.letture.length > 0 && (
          <ol className='divide-y divide-border-default text-sm'>
            {k.letture.slice(0, VISIBILI).map(l => (
              <li key={l.uuid} className='grid grid-cols-[7rem_1fr_auto] items-start gap-3 py-1.5'>
                <span className='text-text-secondary'>{giornoBreve(l.lettoIl)}</span>
                <span className='min-w-0'>
                  <span className='tabular-nums text-text-primary'>{misura(l.valore, c.unita)}</span>
                  {l.anomala && (
                    <span className='ml-2 font-semibold text-orange-700 [.dark_&]:text-orange-400'>minore di una precedente: da controllare</span>
                  )}
                  {l.note && <span className='block truncate text-xs text-text-secondary'>{l.note}</span>}
                </span>
                {puoCorreggere?.(l) ? (
                  <Suggerimento content='Sbagliata? Eliminala e inserisci quella giusta'>
                    <button
                      type='button'
                      onClick={() => setDaCorreggere(l)}
                      disabled={k.inCorso}
                      aria-label={`Elimina la lettura del ${giornoBreve(l.lettoIl)}`}
                      className='rounded-md p-1 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-50'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </Suggerimento>
                ) : (
                  <span />
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
      <ConfirmModal
        isOpen={!!daCorreggere}
        onClose={() => setDaCorreggere(null)}
        onConfirm={async () => {
          if (daCorreggere && (await k.elimina(daCorreggere))) {
            setDaCorreggere(null);
            if (puoScrivere) setNuova(true); // subito la lettura giusta
          }
        }}
        title='Eliminare la lettura?'
        message={daCorreggere ? `${misura(daCorreggere.valore, c.unita)} del ${giornoBreve(daCorreggere.lettoIl)}: il contatore si ricalcola dalle altre letture.` : ''}
        confirmText='Elimina'
        cancelText='Annulla'
        variant='danger'
        isLoading={k.inCorso}
        loadingText='Elimino…'
      />
    </Riquadro>
  );
};
