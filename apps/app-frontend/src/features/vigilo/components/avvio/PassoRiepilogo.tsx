// src/features/vigilo/components/avvio/PassoRiepilogo.tsx
//
// Passo 3: che cosa verrà creato, tipo per tipo, e i predefiniti proposti ai
// controlli che il cliente aggiungerà in seguito.
import React from 'react';
import { Card } from '@edg/ui';

import { PreavvisiEditor } from '../PreavvisiEditor';
import { TIPI } from '../../constants/tipiSoggetto';
import type { Predefiniti } from '../../types/valori';
import type { ConteggioTipo } from '../../utils/selezione';

interface Props {
  perTipo: ConteggioTipo[];
  giaPresenti: number;
  predefiniti: Predefiniti;
  onPredefiniti: (p: Predefiniti) => void;
}

const parola = (n: number, uno: string, molti: string) => `${n} ${n === 1 ? uno : molti}`;

export const PassoRiepilogo: React.FC<Props> = ({ perTipo, giaPresenti, predefiniti, onPredefiniti }) => {
  const categorie = perTipo.reduce((a, t) => a + t.nuoveCategorie, 0);
  const controlli = perTipo.reduce((a, t) => a + t.nuoviControlli, 0);
  const righe = perTipo.filter(t => t.nuoveCategorie || t.nuoviControlli);
  const tolleranza = predefiniti.tolleranza.giorni;

  return (
    <section className='space-y-6'>
      <div>
        <h2 className='text-lg font-semibold text-text-primary'>Riepilogo</h2>
        <p className='text-sm text-text-secondary'>Controlla che cosa verrà creato. Potrai cambiare tutto anche dopo.</p>
      </div>

      <Card padding='lg'>
        <p className='text-xl font-semibold text-text-primary'>
          Stai per creare {parola(categorie, 'categoria', 'categorie')} e {parola(controlli, 'controllo', 'controlli')}
        </p>
        {giaPresenti > 0 && (
          <p className='mt-1 text-sm text-text-secondary'>
            {parola(giaPresenti, 'controllo è già presente e resta', 'controlli sono già presenti e restano')} come {giaPresenti === 1 ? "è" : 'sono'}.
          </p>
        )}
        {righe.length > 0 && (
          <ul className='mt-4 grid gap-2 sm:grid-cols-2'>
            {righe.map(t => {
              const Icona = TIPI[t.tipo].icona;
              return (
                <li key={t.tipo} className='flex items-center gap-3 rounded-lg bg-bg-secondary px-3 py-2 text-sm'>
                  <Icona className='h-4 w-4 text-text-secondary' aria-hidden />
                  <span className='font-medium text-text-primary'>{TIPI[t.tipo].plurale}</span>
                  <span className='text-text-secondary'>
                    {[t.nuoveCategorie && parola(t.nuoveCategorie, 'categoria', 'categorie'), parola(t.nuoviControlli, 'controllo', 'controlli')]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card padding='lg'>
        <h3 className='font-semibold text-text-primary'>Per i controlli che aggiungerai in seguito</h3>
        <p className='mb-4 text-sm text-text-secondary'>
          Proposti a ogni controllo nuovo creato da te; quelli della libreria hanno già i loro.
        </p>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <span className='text-sm font-medium text-text-label'>Avvisi prima della scadenza</span>
            <PreavvisiEditor
              giorni={predefiniti.preavvisi.giorni}
              onChange={giorni => onPredefiniti({ ...predefiniti, preavvisi: { ...predefiniti.preavvisi, giorni } })}
            />
          </div>
          <label className='flex flex-wrap items-center gap-2 text-sm'>
            <span className='font-medium text-text-label'>Tolleranza dopo la scadenza</span>
            <input
              type='number'
              min={0}
              max={1024}
              inputMode='numeric'
              value={tolleranza}
              onChange={e => {
                const g = Math.min(1024, Math.max(0, Math.trunc(Number(e.target.value) || 0)));
                onPredefiniti({ ...predefiniti, tolleranza: { ...predefiniti.tolleranza, giorni: g } });
              }}
              className='w-20 rounded-md border border-border-default bg-bg-primary px-2 py-1 text-text-primary'
            />
            <span className='text-text-secondary'>{tolleranza === 0 ? 'giorni (nessuna)' : tolleranza === 1 ? 'giorno' : 'giorni'}</span>
          </label>
        </div>
      </Card>
    </section>
  );
};
