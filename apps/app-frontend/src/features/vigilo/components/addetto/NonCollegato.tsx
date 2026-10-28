// src/features/vigilo/components/addetto/NonCollegato.tsx
//
// L'addetto il cui account non è ancora collegato a una persona (05-permessi
// 5.4): non vede niente, e gli si dice perché e a chi chiedere.
import React from 'react';
import { User } from '@edg/ui';

export const NonCollegato: React.FC = () => (
  <div className='mx-auto flex min-h-[48vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center'>
    <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-bg-secondary text-text-secondary' aria-hidden>
      <User className='h-6 w-6' />
    </div>
    <h1 className='text-xl font-semibold text-text-primary'>Il tuo profilo non è ancora collegato</h1>
    <p className='text-text-secondary'>
      Per vedere le tue scadenze e i mezzi che usi, l’ufficio deve collegare il tuo account alla tua scheda in Vigilo. Rivolgiti a chi gestisce
      Vigilo nella tua azienda.
    </p>
  </div>
);
