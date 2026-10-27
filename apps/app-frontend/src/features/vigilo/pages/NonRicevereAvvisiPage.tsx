// src/features/vigilo/pages/NonRicevereAvvisiPage.tsx
//
// "Non ricevere più questi avvisi" (B8d-4, ADR098): pagina pubblica, fuori
// dal layout e senza accesso, aperta dal collegamento in fondo alle email di
// chi riceve gli avvisi senza avere un account (?codice=…).
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Logo, PageBackground } from '@edg/ui';

import { ContenutoRecapito } from '../components/recapiti/ContenutoRecapito';
import { useRecapito } from '../hooks/useRecapito';

const NonRicevereAvvisiPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const r = useRecapito(searchParams.get('codice'));

  return (
    <>
      <PageBackground />
      <main className='relative flex min-h-screen items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <div className='mb-8 flex justify-center'>
            <Logo className='text-4xl' />
          </div>
          <div className='rounded-lg border border-border-default bg-bg-primary p-6 text-center shadow-lg sm:p-8' aria-live='polite'>
            <ContenutoRecapito
              scheda={r.scheda}
              problema={r.problema}
              inCorso={r.inCorso}
              appena={r.appena}
              onCambia={escluso => void r.cambia(escluso)}
              onRiprova={() => void r.carica()}
            />
          </div>
          <p className='mt-6 text-center text-xs text-text-secondary'>Vigilo è il servizio di Express Delivery Group che tiene d’occhio le scadenze.</p>
        </div>
      </main>
    </>
  );
};

export default NonRicevereAvvisiPage;
