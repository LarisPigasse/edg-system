// src/pages/Dashboard.tsx
import React from 'react';

import { APP_CONFIG } from '../config';

/**
 * HOME — pagina di ingresso dopo il login.
 *
 * Qui andranno le tessere dei moduli attivi per l'utente. Con un solo modulo
 * attivo conviene invece portarlo direttamente alla sua home.
 */
const Dashboard: React.FC = () => {
  return (
    <div className='flex h-full min-h-[50vh] flex-col items-center justify-center px-4 text-center'>
      <h1>
        <span className='font-semibold text-text-primary text-xl sm:text-2xl uppercase'>{APP_CONFIG.SIGLA}</span>
        <span className={`${APP_CONFIG.COLORE} font-bold text-3xl font-semibold tracking-tight sm:text-5xl `}>
          {APP_CONFIG.TITOLO}
        </span>
      </h1>
      <span aria-hidden className='mt-5 block h-px w-64 bg-violet-500/70' />
      <p className='mt-5 max-w-xl text-text-primary sm:text-lg'>{APP_CONFIG.TAGLINE}</p>
    </div>
  );
};

export default Dashboard;
