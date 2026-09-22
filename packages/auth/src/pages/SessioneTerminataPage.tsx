// src/pages/SessioneTerminataPage.tsx
//
// Destinazione del redirect "duro" imposto da services/sessionGuard.ts
// quando una richiesta autenticata torna 401 in modo definitivo. Rotta
// pubblica (non protetta da PrivateRoute): ci si arriva proprio perché non
// si è più autenticati, e sessionGuard ha già pulito lo storage.
//
// Il motivo arriva come query string (?reason=...) col messaggio del
// backend: qui viene solo classificato per scegliere titolo e testo, mai
// mostrato alla lettera (potrebbe essere in inglese o troppo tecnico).

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, Logo, PageBackground, useEdgConfig } from '@edg/ui';

interface ReasonCopy {
  title: string;
  message: string;
}

function classifyReason(reason: string | null): ReasonCopy {
  const normalized = (reason ?? '').toLowerCase();

  if (normalized.includes('disattiv') || normalized.includes('bloccat')) {
    return {
      title: 'Account bloccato',
      message: "Il tuo account è stato disattivato da un amministratore. Contatta l'amministratore di sistema per maggiori informazioni.",
    };
  }

  if (normalized.includes('revocat')) {
    return {
      title: 'Sessione terminata',
      message: 'Un amministratore ha chiuso questa sessione da un altro dispositivo. Se non sei stato tu, contatta subito un amministratore.',
    };
  }

  return {
    title: 'Sessione scaduta',
    message: 'La tua sessione non è più valida. Effettua nuovamente l’accesso per continuare.',
  };
}

export const SessioneTerminataPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { routes } = useEdgConfig();
  const { title, message } = classifyReason(searchParams.get('reason'));

  return (
    <>
      <PageBackground />
      <div className='relative min-h-screen flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <div className='text-center mb-8'>
            <div className='flex justify-center mb-6'>
              <Logo className='text-4xl' />
            </div>
          </div>

          <div className='bg-bg-primary rounded-xl shadow-lg border border-border-default p-6 sm:p-8 text-center'>
            <div className='flex justify-center mb-4'>
              <div className='w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center'>
                <Lock className='w-8 h-8 text-red-600 dark:text-red-400' />
              </div>
            </div>

            <h1 className='text-xl font-semibold text-text-primary mb-2'>{title}</h1>
            <p className='text-text-secondary mb-6'>{message}</p>

            <Link
              to={routes.login}
              className='inline-flex items-center justify-center gap-2 text-text-link hover:text-text-link-hover transition-colors'
            >
              Torna al login
            </Link>
          </div>

          <p className='mt-8 text-center text-xs text-text-tertiary'>
            © {new Date().getFullYear()} Express Delivery Group. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </>
  );
};

export default SessioneTerminataPage;
