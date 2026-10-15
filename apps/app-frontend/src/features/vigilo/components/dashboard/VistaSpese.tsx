// src/features/vigilo/components/dashboard/VistaSpese.tsx
// La seconda vista della dashboard: "quanto spendo, quanto consumo". Da sviluppare.
import React from 'react';

export const VistaSpese: React.FC = () => (
  <section className='flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-default bg-bg-primary px-8 py-12 text-center'>
    <span className='text-xs font-bold uppercase tracking-wider text-text-link'>In sviluppo</span>
    <h2 className='text-2xl font-bold text-text-primary'>Quanto spendo, quanto consumo</h2>
    <p className='max-w-xl text-[15px] text-text-secondary'>
      Spese dell'anno per natura e per soggetto, confronto con l'anno precedente, km e ore dai contatori. Arriverà con la
      gestione dei costi.
    </p>
  </section>
);
