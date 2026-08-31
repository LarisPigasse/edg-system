// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@edg/ui';

import { ROUTES } from '../config';

const NotFound: React.FC = () => {
  return (
    <div className='flex h-full min-h-[50vh] flex-col items-center justify-center px-4 text-center'>
      <p className='text-6xl font-bold text-text-secondary'>404</p>
      <h1 className='mt-4 text-2xl font-semibold text-text-primary'>Pagina non trovata</h1>
      <p className='mt-2 max-w-md text-sm text-text-secondary'>
        L'indirizzo richiesto non esiste, oppure non hai accesso a questa sezione.
      </p>
      <Link to={ROUTES.HOME} className='mt-6'>
        <Button variant='primary'>Torna alla home</Button>
      </Link>
    </div>
  );
};

export default NotFound;
