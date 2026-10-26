// src/features/vigilo/components/avvisi/SezionePreferenze.tsx
//
// Il riquadro di una sezione delle preferenze: titolo, spiegazione, contenuto.
import React from 'react';

export const SezionePreferenze: React.FC<{ titolo: string; descrizione?: React.ReactNode; children: React.ReactNode }> = ({
  titolo,
  descrizione,
  children,
}) => (
  <section className='space-y-4 rounded-lg border border-border-default bg-bg-primary p-5'>
    <header>
      <h2 className='text-base font-semibold text-text-primary'>{titolo}</h2>
      {descrizione && <p className='mt-0.5 text-sm text-text-secondary'>{descrizione}</p>}
    </header>
    {children}
  </section>
);
