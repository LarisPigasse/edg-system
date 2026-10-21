// packages/auth/src/components/AssistenzaBar.tsx
//
// Barra dell'accesso assistito (ADR085): sempre visibile in cima alla pagina
// nella scheda assistita, dice in quale tenant si sta lavorando, chi agisce e
// quando scade, con il pulsante per uscire. Fuori dall'assistenza non mostra
// nulla: l'applicazione la passa al layout senza condizioni.
//
// Ambra durante la sessione, rossa negli ultimi 8 minuti.
import React, { useState } from 'react';

import { useAssistenza } from '../hooks/useAssistenza';

const MODO: Record<string, string> = {
  preparazione: 'Preparazione',
  assistenza: 'Assistenza in sola lettura',
};

export const AssistenzaBar: React.FC = () => {
  const { assistenza, minutiRimasti, inScadenza, scadeAlle, esci } = useAssistenza();
  const [uscendo, setUscendo] = useState(false);

  if (!assistenza) return null;

  const colori = inScadenza ? 'bg-action-danger text-action-danger-text' : 'bg-action-warning text-action-warning-text';
  const mancano = minutiRimasti === 1 ? 'manca 1 minuto' : `mancano ${minutiRimasti} minuti`;

  const handleEsci = async () => {
    setUscendo(true);
    await esci();
  };

  return (
    <div className={`${colori} transition-colors`} role='status' aria-live='polite'>
      <div className='flex h-8 items-center gap-4 px-2 text-sm sm:px-4'>
        <p className='flex min-w-0 flex-1 items-center gap-2'>
          <span className='shrink-0 font-semibold'>Accesso assistito</span>
          <span aria-hidden='true' className='hidden opacity-60 sm:inline'>
            ·
          </span>
          <span className='hidden shrink-0 sm:inline'>{MODO[assistenza.modo] ?? assistenza.modo}</span>
          <span aria-hidden='true' className='opacity-60'>
            ·
          </span>
          <span className='truncate font-semibold' title={assistenza.tenant.nome}>
            {assistenza.tenant.nome}
          </span>
        </p>

        <p className='hidden shrink-0 items-center gap-2 md:flex'>
          <span className='max-w-48 truncate' title={assistenza.operatore.email}>
            {assistenza.operatore.nome}
          </span>
          <span aria-hidden='true' className='opacity-60'>
            ·
          </span>
          <span className={inScadenza ? 'font-semibold' : undefined}>
            scade alle {scadeAlle} ({mancano})
          </span>
        </p>
        <span className={`shrink-0 md:hidden ${inScadenza ? 'font-semibold' : ''}`}>{minutiRimasti} min</span>

        <button
          type='button'
          onClick={handleEsci}
          disabled={uscendo}
          className='h-6 shrink-0 rounded-md border border-current/40 px-2 text-xs font-semibold transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current disabled:opacity-60'
        >
          {uscendo ? 'Uscita…' : 'Esci'}
        </button>
      </div>
    </div>
  );
};

export default AssistenzaBar;
