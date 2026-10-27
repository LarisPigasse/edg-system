// src/features/vigilo/components/recapiti/ContenutoRecapito.tsx
//
// Il contenuto della pagina "Non ricevere più questi avvisi" (B8d-4): chi
// scrive e a quale indirizzo, la conferma, il ripensamento. Due passi
// apposta: i filtri della posta aprono i collegamenti da soli, quindi aprire
// la pagina non cambia niente; serve il clic su "Non riceverli più".
import React from 'react';
import { AlertTriangle, Bell, BellOff, Button, CheckCircle, Skeleton } from '@edg/ui';

import type { ProblemaRecapito } from '../../hooks/useRecapito';
import type { SchedaRecapito } from '../../types/recapiti';

const PROBLEMI: Record<ProblemaRecapito, { titolo: string; testo: string; riprova: boolean }> = {
  'non-valido': {
    titolo: 'Collegamento non valido',
    testo: 'Questo collegamento non funziona. Se l’hai copiato dall’email, controlla di averlo copiato per intero.',
    riprova: false,
  },
  'troppe-richieste': { titolo: 'Troppe richieste', testo: 'Riprova fra qualche minuto.', riprova: true },
  altro: { titolo: 'Qualcosa non ha funzionato', testo: 'Non è stato possibile completare la richiesta. Riprova fra poco.', riprova: true },
};

const Icona: React.FC<{ children: React.ReactNode; tono: 'neutro' | 'fatto' | 'problema' }> = ({ children, tono }) => (
  <div
    className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${
      // gli stessi colori di Alert di @edg/ui
      tono === 'fatto'
        ? 'bg-modal-success-bg text-modal-success-text'
        : tono === 'problema'
          ? 'bg-modal-warning-bg text-modal-warning-text'
          : 'bg-bg-secondary text-text-secondary'
    }`}
    aria-hidden
  >
    {children}
  </div>
);

interface Props {
  scheda: SchedaRecapito | null;
  problema: ProblemaRecapito | null;
  inCorso: boolean;
  appena: 'escluso' | 'riattivato' | null;
  onCambia: (escluso: boolean) => void;
  onRiprova: () => void;
}

export const ContenutoRecapito: React.FC<Props> = ({ scheda, problema, inCorso, appena, onCambia, onRiprova }) => {
  // senza scheda un problema occupa tutto; con la scheda resta una riga sotto i pulsanti
  if (!scheda && problema) {
    const p = PROBLEMI[problema];
    return (
      <>
        <Icona tono='problema'>
          <AlertTriangle className='h-6 w-6' />
        </Icona>
        <h1 className='mb-2 text-xl font-semibold text-text-primary'>{p.titolo}</h1>
        <p className='text-text-secondary'>{p.testo}</p>
        {p.riprova && (
          <Button variant='secondary' onClick={onRiprova} className='mt-6'>
            Riprova
          </Button>
        )}
      </>
    );
  }

  if (!scheda) {
    return (
      <div className='space-y-3' aria-busy>
        <Skeleton className='mx-auto h-12 w-12' />
        <Skeleton className='mx-auto h-6 w-3/4' />
        <Skeleton className='h-16 w-full' />
      </div>
    );
  }

  const chi = scheda.tenant ?? 'L’azienda';
  const perConto = scheda.tenant ? `per conto di ${scheda.tenant}` : 'per conto di questa azienda';
  const errore = problema ? <p className='mt-4 text-sm font-medium text-text-danger'>{PROBLEMI[problema].testo}</p> : null;

  if (scheda.escluso) {
    return (
      <>
        <Icona tono='fatto'>{appena === 'escluso' ? <CheckCircle className='h-6 w-6' /> : <BellOff className='h-6 w-6' />}</Icona>
        <h1 className='mb-2 text-xl font-semibold text-text-primary'>Non riceverai più questi avvisi</h1>
        <p className='text-text-secondary'>
          {appena === 'escluso' ? 'Fatto: ' : 'Avevi già chiesto di non riceverli: '}Vigilo non scriverà più a <span className='font-medium text-text-primary'>{scheda.email}</span>{' '}
          {perConto}.
        </p>
        <Button variant='link' onClick={() => onCambia(false)} isLoading={inCorso} loadingText='Un momento…' className='mt-6'>
          Ho sbagliato, voglio riceverli di nuovo
        </Button>
        {errore}
      </>
    );
  }

  return (
    <>
      <Icona tono={appena === 'riattivato' ? 'fatto' : 'neutro'}>{appena === 'riattivato' ? <CheckCircle className='h-6 w-6' /> : <Bell className='h-6 w-6' />}</Icona>
      <h1 className='mb-2 text-xl font-semibold text-text-primary'>{appena === 'riattivato' ? 'Riceverai di nuovo gli avvisi' : 'Avvisi delle scadenze'}</h1>
      <p className='text-text-secondary'>
        <span className='font-medium text-text-primary'>{chi}</span> ti manda con Vigilo gli avvisi delle sue scadenze, all’indirizzo{' '}
        <span className='font-medium text-text-primary'>{scheda.email}</span>.
      </p>
      <p className='mt-3 text-text-secondary'>
        {appena === 'riattivato' ? 'Se cambi idea, puoi smettere di riceverli in ogni momento.' : 'Se non vuoi più riceverli, conferma qui sotto.'}
      </p>
      <Button onClick={() => onCambia(true)} isLoading={inCorso} loadingText='Un momento…' fullWidth className='mt-6'>
        Non riceverli più
      </Button>
      {errore}
    </>
  );
};
