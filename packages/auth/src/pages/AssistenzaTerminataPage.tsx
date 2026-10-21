// packages/auth/src/pages/AssistenzaTerminataPage.tsx
//
// Fine della scheda assistita (ADR085): uscita, scadenza dei 64 minuti o
// chiusura da EDG Pro (?motivo=uscita|scaduta|chiusa). La sessione normale
// dell'operatore, nelle altre schede, non è cambiata. Rotta pubblica, fuori
// dal layout.
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Logo, PageBackground } from '@edg/ui';

const TESTI: Record<string, { titolo: string; testo: string }> = {
  uscita: {
    titolo: 'Assistenza terminata',
    testo: 'Sei uscito dall’accesso assistito. La tua sessione in EDG Pro non è cambiata.',
  },
  scaduta: {
    titolo: 'Assistenza scaduta',
    testo: 'I 64 minuti dell’accesso assistito sono finiti. Per continuare apri un nuovo accesso da EDG Pro.',
  },
  chiusa: {
    titolo: 'Assistenza chiusa',
    testo: 'Questa sessione di assistenza è stata chiusa da EDG Pro.',
  },
};

export const AssistenzaTerminataPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { titolo, testo } = TESTI[searchParams.get('motivo') ?? ''] ?? TESTI.scaduta;

  return (
    <>
      <PageBackground />
      <div className='relative flex min-h-screen items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <div className='mb-8 flex justify-center'>
            <Logo className='text-4xl' />
          </div>

          <div className='rounded-lg border border-border-default bg-bg-primary p-6 text-center shadow-lg sm:p-8'>
            <h1 className='mb-2 text-xl font-semibold text-text-primary'>{titolo}</h1>
            <p className='mb-6 text-text-secondary'>{testo}</p>
            <button
              type='button'
              onClick={() => window.close()}
              className='text-text-link transition-colors hover:text-text-link-hover'
            >
              Chiudi la scheda
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssistenzaTerminataPage;
