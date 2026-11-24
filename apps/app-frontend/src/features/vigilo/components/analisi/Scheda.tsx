// src/features/vigilo/components/analisi/Scheda.tsx — il contenitore delle sezioni dell'Analisi (2026-11-23)
import React from 'react';

export const Scheda: React.FC<{ titolo: string; sotto?: React.ReactNode; azioni?: React.ReactNode; children: React.ReactNode }> = ({ titolo, sotto, azioni, children }) => (
  <section className='min-w-0 space-y-4 rounded-lg border border-border-thin bg-bg-primary p-5'>
    {/* titolo e azioni sulla stessa riga */}
    <div className='flex items-start justify-between gap-3'>
      <div className='min-w-0'>
        <h2 className='text-base font-bold text-text-primary'>{titolo}</h2>
        {sotto && <p className='text-sm text-text-secondary'>{sotto}</p>}
      </div>
      {azioni}
    </div>
    {children}
  </section>
);

/** Una riga etichetta–valore, con una nota facoltativa sotto */
export const Riga: React.FC<{ etichetta: React.ReactNode; valore: React.ReactNode; nota?: React.ReactNode; forte?: boolean }> = ({ etichetta, valore, nota, forte }) => (
  <div className='flex items-baseline justify-between gap-4 border-b border-border-thin py-1.5 last:border-b-0'>
    <span className='min-w-0'>
      <span className={forte ? 'font-semibold text-text-primary' : 'text-text-primary'}>{etichetta}</span>
      {nota && <span className='block text-xs text-text-secondary'>{nota}</span>}
    </span>
    <span className={forte ? 'shrink-0 font-semibold tabular-nums text-text-primary' : 'shrink-0 tabular-nums text-text-primary'}>{valore}</span>
  </div>
);
