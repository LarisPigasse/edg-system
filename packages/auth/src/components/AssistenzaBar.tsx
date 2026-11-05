// packages/auth/src/components/AssistenzaBar.tsx
//
// Barra dell'accesso assistito (ADR085): sempre visibile in cima alla pagina
// nella scheda assistita, dice in quale tenant si sta lavorando, chi agisce e
// quando scade, con il pulsante per uscire. Fuori dall'assistenza non mostra
// nulla: l'applicazione la passa al layout senza condizioni.
//
// In Assistenza (sola lettura, AA4) dice anche come chi si sta guardando:
// "come Mario Rossi (addetto)".
//
// Ambra durante la sessione, rossa negli ultimi 8 minuti.
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { useAssistenza } from '../hooks/useAssistenza';
import { selectAccount } from '../store';

const MODO: Record<string, string> = {
  preparazione: 'Preparazione',
  assistenza: 'Assistenza in sola lettura',
};

export const AssistenzaBar: React.FC = () => {
  const { assistenza, minutiRimasti, inScadenza, scadeAlle, esci } = useAssistenza();
  const ruolo = useSelector(selectAccount)?.roleName;
  const [uscendo, setUscendo] = useState(false);

  if (!assistenza) return null;

  const perConto = assistenza.modo === 'assistenza' ? assistenza.perConto : null;

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
          {/* sui telefoni la modalità non c'è, ma "come X" sì: il punto serve */}
          <span aria-hidden='true' className={perConto ? 'opacity-60' : 'hidden opacity-60 sm:inline'}>
            ·
          </span>
          <span className='hidden shrink-0 sm:inline'>{MODO[assistenza.modo] ?? assistenza.modo}</span>
          {perConto && (
            <span className='min-w-0 truncate' title={perConto.email}>
              come <span className='font-semibold'>{perConto.nome}</span>
              {ruolo && <span className='hidden lg:inline'> ({ruolo})</span>}
            </span>
          )}
          <span aria-hidden='true' className='opacity-60'>
            ·
          </span>
          <span className='truncate font-semibold' title={assistenza.tenant.nome}>
            {assistenza.tenant.nome}
          </span>
        </p>

        <p className='hidden shrink-0 items-center gap-2 md:flex'>
          {/* con "come X" la riga è lunga: il nome dell'operatore da 1280 px */}
          <span className={`max-w-48 truncate ${perConto ? 'hidden xl:inline' : ''}`} title={assistenza.operatore.email}>
            {assistenza.operatore.nome}
          </span>
          <span aria-hidden='true' className={`opacity-60 ${perConto ? 'hidden xl:inline' : ''}`}>
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
