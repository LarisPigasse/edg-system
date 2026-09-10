// src/pages/SupportPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@edg/ui';

import { ROUTES } from '../config';

/**
 * Pagina segnaposto: struttura pronta, contenuto da compilare con contatti,
 * canali e orari per richiedere assistenza.
 */
const SupportPage: React.FC = () => {
  return (
    <div className='flex h-full min-h-[50vh] flex-col items-center justify-center px-4 text-center'>
      <p className='text-6xl font-bold text-text-title'>Supporto</p>
      <h1 className='mt-4 text-2xl font-semibold text-text-primary'>Questa pagina è un segnaposto</h1>
      <p className='mt-2 max-w-md text-sm text-text-secondary'>Qui andranno le indicazioni per richiedere assistenza.</p>
      <Link to={ROUTES.HOME} className='mt-6'>
        <Button variant='primary'>Torna alla home</Button>
      </Link>
    </div>
  );
};

export default SupportPage;
