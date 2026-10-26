// src/features/vigilo/components/avvisi/PreferenzeAvvisi.tsx
//
// La scheda Preferenze di "I miei avvisi" (B8d-1): quando arrivano le email e
// di che cosa, affiancate sugli schermi larghi; sotto, Salva e Ripristina i
// predefiniti. Le email cambiano da subito (anche quelle in coda), i filtri
// valgono dai prossimi avvisi.
import React from 'react';
import { Alert, Button, Skeleton } from '@edg/ui';

import type { StatoPreferenzeAvvisi } from '../../hooks/usePreferenzeAvvisi';
import { SceltaArgomenti } from './SceltaArgomenti';
import { SceltaEmail } from './SceltaEmail';

export const PreferenzeAvvisi: React.FC<{ p: StatoPreferenzeAvvisi; email: string | null }> = ({ p, email }) => {
  const { scheda, bozza } = p;

  if (p.errore && !scheda)
    return (
      <Alert variant='danger' title='Impossibile leggere le preferenze'>
        {p.errore}
      </Alert>
    );

  if (!scheda || !bozza)
    return (
      <div className='grid gap-6 lg:grid-cols-2'>
        <Skeleton className='h-96 rounded-lg' />
        <Skeleton className='h-64 rounded-lg' />
      </div>
    );

  return (
    <div className='space-y-6'>
      <div className='grid items-start gap-6 lg:grid-cols-2'>
        <SceltaEmail bozza={bozza} regole={scheda.regole} email={email} onCambia={p.aggiorna} />
        <SceltaArgomenti
          bozza={bozza}
          comeUfficio={scheda.comeUfficio}
          sedi={scheda.sedi}
          limiteSedi={scheda.limiti.sedi}
          problema={p.problema}
          onCambia={p.aggiorna}
        />
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3 border-t border-border-default pt-4'>
        <p className='text-sm text-text-secondary'>
          {p.modificata
            ? 'Modifiche non salvate.'
            : scheda.salvate
              ? 'Le tue preferenze sono salvate.'
              : 'Stai usando le preferenze predefinite.'}
        </p>
        <div className='flex flex-wrap gap-2'>
          {p.modificata && (
            <Button variant='link' onClick={p.annulla} disabled={p.inCorso}>
              Annulla le modifiche
            </Button>
          )}
          <Button variant='secondary' onClick={p.ripristina} disabled={p.inCorso || !scheda.salvate}>
            Ripristina i predefiniti
          </Button>
          <Button onClick={p.salva} disabled={!p.modificata || !!p.problema} isLoading={p.inCorso} loadingText='Salvo…'>
            Salva
          </Button>
        </div>
      </div>
    </div>
  );
};
