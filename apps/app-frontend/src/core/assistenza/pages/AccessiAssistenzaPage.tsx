// src/core/assistenza/pages/AccessiAssistenzaPage.tsx
//
// "Accessi dell'assistenza EDG" (AA5): l'amministratore del cliente vede
// quando il personale EDG è entrato nel suo spazio, in quale modalità e
// perché. Nel menu utente, solo con il permesso account.assistenze; senza,
// la pagina lo dice e non legge nulla. Un accesso in corso si vede in alto.
import React from 'react';
import { useAuth } from '@edg/auth';
import { Alert, PageHeader } from '@edg/ui';

import { SchedeAccessi } from '../components/SchedeAccessi';
import { TabellaAccessi } from '../components/TabellaAccessi';
import { MODO_ACCESSO, MODO_SPIEGAZIONE, PERMESSO_ACCESSI_ASSISTENZA } from '../constants';
import { useAccessiAssistenza } from '../hooks/useAccessiAssistenza';
import { conteggioAccessi } from '../utils';

const ORA = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' });

const Contenuto: React.FC = () => {
  const { accessi, caricamento, errore, ricarica } = useAccessiAssistenza();
  const inCorso = accessi.filter(a => a.stato === 'aperta');

  return (
    <div className='space-y-6'>
      <PageHeader
        title="Accessi dell'assistenza EDG"
        subtitle='Qui vedi quando il personale EDG è entrato nel tuo spazio e perché.'
        onRefresh={() => void ricarica()}
        isLoading={caricamento}
      />

      {/* le due modalità in parole, una volta sola */}
      <dl className='grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2'>
        {(['preparazione', 'assistenza'] as const).map(m => (
          <div key={m}>
            <dt className='inline font-semibold text-text-primary'>{MODO_ACCESSO[m]}: </dt>
            <dd className='inline text-text-secondary'>{MODO_SPIEGAZIONE[m].toLowerCase()}.</dd>
          </div>
        ))}
      </dl>

      {inCorso.map(a => (
        <Alert key={a.uuid} variant='warning' title='Accesso in corso'>
          {a.operatore} di EDG è nel tuo spazio ({MODO_ACCESSO[a.modo].toLowerCase()}
          {a.perConto ? `, come ${a.perConto}` : ''}) fino alle {ORA.format(new Date(a.scade))}: «{a.motivo}».
        </Alert>
      ))}

      {errore ? (
        <Alert variant='danger' title='Accessi non disponibili'>
          {errore}
        </Alert>
      ) : (
        <div className='space-y-2'>
          {!caricamento && accessi.length > 0 && <p className='text-sm text-text-secondary'>{conteggioAccessi(accessi)}</p>}
          {/* la tabella da 1280 px: sotto, sei colonne non ci stanno e si usano le schede */}
          <div className='hidden xl:block'>
            <TabellaAccessi accessi={accessi} caricamento={caricamento} />
          </div>
          <div className='xl:hidden'>
            <SchedeAccessi accessi={accessi} caricamento={caricamento} />
          </div>
        </div>
      )}
    </div>
  );
};

const AccessiAssistenzaPage: React.FC = () => {
  const { hasPermission } = useAuth();
  if (!hasPermission(PERMESSO_ACCESSI_ASSISTENZA)) {
    return (
      <Alert variant='warning' title="Accessi dell'assistenza EDG">
        Questa pagina è per l'amministratore del tuo spazio.
      </Alert>
    );
  }
  return <Contenuto />;
};

export default AccessiAssistenzaPage;
