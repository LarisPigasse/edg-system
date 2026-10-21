// packages/auth/src/pages/AssistenzaIngressoPage.tsx
//
// Ingresso nella scheda assistita (ADR085). EDG Pro apre questa pagina in una
// nuova scheda con il codice monouso dopo '#' (/assistenza#<codice>): la parte
// dopo '#' non arriva mai ai server né ai loro log. La pagina:
//   1. toglie subito il codice dall'indirizzo (cronologia compresa);
//   2. lo cambia con il token assistito (POST /auth/assistenza/scambio);
//   3. salva la sessione assistita nella scheda e riparte dalla home, con un
//      caricamento completo, così tutto lo stato nasce già "assistito".
// Rotta pubblica, fuori dal layout.
import React, { useEffect, useRef, useState } from 'react';
import { Lock, Logo, PageBackground } from '@edg/ui';

import { authApi } from '../api';
import { saveAssistenza } from '../services/tokenStore';

interface AssistenzaIngressoPageProps {
  /** Dove andare a ingresso riuscito (default la home) */
  destinazione?: string;
}

export const AssistenzaIngressoPage: React.FC<AssistenzaIngressoPageProps> = ({ destinazione = '/' }) => {
  const [errore, setErrore] = useState<string | null>(null);
  // In sviluppo React esegue gli effetti due volte: il codice è monouso
  const avviato = useRef(false);

  useEffect(() => {
    if (avviato.current) return;
    avviato.current = true;

    const codice = window.location.hash.slice(1);
    window.history.replaceState(null, '', window.location.pathname);

    if (!codice) {
      setErrore('Il collegamento è incompleto: riapri l’accesso assistito da EDG Pro.');
      return;
    }

    void authApi.scambiaAssistenza(codice).then(risposta => {
      if (!risposta.success || !risposta.data) {
        setErrore(risposta.error ?? 'Accesso assistito non riuscito: riprova da EDG Pro.');
        return;
      }
      const { accessToken, account, assistenza } = risposta.data;
      saveAssistenza({ accessToken, account, assistenza });
      window.location.replace(destinazione);
    });
  }, [destinazione]);

  return (
    <>
      <PageBackground />
      <div className='relative flex min-h-screen items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <div className='mb-8 flex justify-center'>
            <Logo className='text-4xl' />
          </div>

          <div className='rounded-lg border border-border-default bg-bg-primary p-6 text-center shadow-lg sm:p-8'>
            {errore ? (
              <>
                <div className='mb-4 flex justify-center'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30'>
                    <Lock className='h-8 w-8 text-red-600 dark:text-red-400' />
                  </div>
                </div>
                <h1 className='mb-2 text-xl font-semibold text-text-primary'>Accesso assistito non riuscito</h1>
                <p className='mb-6 text-text-secondary'>{errore}</p>
                <button
                  type='button'
                  onClick={() => window.close()}
                  className='text-text-link transition-colors hover:text-text-link-hover'
                >
                  Chiudi la scheda
                </button>
              </>
            ) : (
              <>
                <div className='mb-4 flex justify-center'>
                  <div className='h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600' />
                </div>
                <h1 className='mb-2 text-xl font-semibold text-text-primary'>Accesso assistito</h1>
                <p className='text-text-secondary'>Ingresso nel tenant del cliente in corso…</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AssistenzaIngressoPage;
