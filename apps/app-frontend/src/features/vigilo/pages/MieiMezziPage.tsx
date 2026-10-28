// src/features/vigilo/pages/MieiMezziPage.tsx
//
// "I miei mezzi" dell'addetto (B9b, 07-interfaccia 7.10): i mezzi che ha
// assegnati oggi, con i contatori per inserire subito km o ore. Una lettura
// sbagliata si corregge (solo le sue). Senza persona collegata, il perché.
import React from 'react';
import { Alert, PageHeader, Skeleton } from '@edg/ui';

import { NonCollegato } from '../components/addetto/NonCollegato';
import { RichiedeAvvio } from '../components/RichiedeAvvio';
import { Riquadro } from '../components/Riquadro';
import { CartaContatore } from '../components/soggetto/CartaContatore';
import { useMieiMezzi } from '../hooks/useMieiMezzi';
import type { ProfiloVigilo } from '../types/io';

const Contenuto: React.FC<{ profilo: ProfiloVigilo }> = ({ profilo }) => {
  const m = useMieiMezzi(!!profilo.persona);
  if (!profilo.persona) return <NonCollegato />;

  return (
    <div className='space-y-6'>
      <PageHeader title='I miei mezzi' subtitle='I mezzi che usi in questo periodo: inserisci qui i chilometri o le ore.' onRefresh={() => void m.ricarica()} />
      {m.errore && !m.mezzi ? (
        <Alert variant='danger' title='Mezzi non letti'>
          {m.errore}
        </Alert>
      ) : !m.mezzi ? (
        <Skeleton className='h-48 w-full' />
      ) : !m.mezzi.length ? (
        <p className='rounded-lg border border-dashed border-border-default p-6 text-center text-sm text-text-secondary'>
          In questo momento non hai mezzi assegnati.
        </p>
      ) : (
        <div className='space-y-6'>
          {m.mezzi.map(s => (
            <section key={s.uuid} className='space-y-3'>
              <h2 className='text-lg font-semibold text-text-primary'>
                {s.nome}
                {s.identificativo && <span className='ml-2 font-mono text-base text-text-secondary'>{s.identificativo}</span>}
              </h2>
              {s.contatori.length ? (
                <div className='grid gap-4 xl:grid-cols-2'>
                  {s.contatori.map(c => (
                    <CartaContatore
                      key={c.uuid}
                      c={c}
                      puoScrivere={s.stato !== 'dismesso'}
                      puoCorreggere={l => l.tua && l.fonte === 'manuale'}
                      onCambiato={() => void m.ricarica()}
                    />
                  ))}
                </div>
              ) : (
                <Riquadro titolo='Contatori'>
                  <p className='text-sm text-text-secondary'>Questo mezzo non ha contatori.</p>
                </Riquadro>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

const MieiMezziPage: React.FC = () => <RichiedeAvvio>{profilo => <Contenuto profilo={profilo} />}</RichiedeAvvio>;

export default MieiMezziPage;
