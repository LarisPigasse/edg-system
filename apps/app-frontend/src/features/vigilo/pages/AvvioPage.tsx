// src/features/vigilo/pages/AvvioPage.tsx
//
// Procedura di avvio (passo 3.5) a pagina intera: settori, che cosa includere,
// riepilogo, fatto. Al primo accesso prepara Vigilo; dopo serve ad
// "Aggiungi dalla libreria" (le voci già presenti restano come sono).
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, ConfirmModal, PageHeader, Skeleton, Stepper, type StepperStep } from '@edg/ui';

import { PassoFatto } from '../components/avvio/PassoFatto';
import { PassoRiepilogo } from '../components/avvio/PassoRiepilogo';
import { PassoSettori } from '../components/avvio/PassoSettori';
import { PassoVoci } from '../components/avvio/PassoVoci';
import { InPreparazione } from '../components/InPreparazione';
import { PASSI, useAvvio, type Passo } from '../hooks/useAvvio';
import { useInCima } from '../hooks/useInCima';

const STEPS: StepperStep[] = [
  { id: 'settori', label: 'Settori', description: 'In che cosa lavora l’azienda' },
  { id: 'voci', label: 'Che cosa includere', description: 'Categorie e controlli' },
  { id: 'riepilogo', label: 'Riepilogo', description: 'Controlla e conferma' },
  { id: 'fatto', label: 'Fatto' },
];

const Caricamento: React.FC = () => (
  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
    {Array.from({ length: 4 }, (_, i) => (
      <Skeleton key={i} className='h-48 rounded-lg' />
    ))}
  </div>
);

const AvvioPage: React.FC = () => {
  const a = useAvvio();
  const navigate = useNavigate();
  const [daZero, setDaZero] = useState(false);
  const indice = PASSI.indexOf(a.passo);
  const vai = (p: Passo) => a.setPasso(p);
  useInCima(a.passo);

  // ADR088: Vigilo lo prepara EDG e non siamo nella sua sessione assistita
  if (a.stato && !a.stato.puoAvviare) return <InPreparazione daEdg={a.stato.preparazione === 'edg'} />;

  const titolo = a.primoAvvio ? 'Prepariamo Vigilo' : 'Aggiungi dalla libreria';
  const sottotitolo = a.primoAvvio
    ? 'Pochi passi per partire con i controlli giusti per la tua azienda.'
    : 'Scegli altre voci dalla libreria EDG: quelle che hai già restano come sono.';

  return (
    <div className='space-y-6'>
      <PageHeader title={titolo} subtitle={sottotitolo} />
      {/* a procedura finita tutti i passi sono fatti */}
      <Stepper
        steps={STEPS}
        current={a.passo === 'fatto' ? STEPS.length : indice}
        onStepClick={a.passo === 'fatto' ? undefined : i => vai(PASSI[i])}
      />

      {a.errore && (
        <Alert variant='danger' title='Impossibile aprire la procedura'>
          {a.errore}
        </Alert>
      )}

      {!a.errore && !a.stato && <Caricamento />}

      {a.stato && (
        <>
          {a.passo === 'settori' && <PassoSettori modelli={a.stato.modelli} scelti={a.modelli} onCommuta={a.commutaModello} />}
          {a.passo === 'voci' && a.proposta && (
            <PassoVoci
              proposta={a.proposta}
              selezione={a.selezione}
              perTipo={a.perTipo}
              onCategorie={a.categorie}
              onControlli={a.controlli}
            />
          )}
          {a.passo === 'riepilogo' && a.proposta && a.predefiniti && (
            <PassoRiepilogo
              perTipo={a.perTipo}
              giaPresenti={a.proposta.riepilogo.giaPresenti.controlli}
              predefiniti={a.predefiniti}
              onPredefiniti={a.setPredefiniti}
            />
          )}
          {a.passo === 'fatto' && a.esito && <PassoFatto esito={a.esito} onVai={percorso => navigate(percorso)} />}

          {a.passo !== 'fatto' && (
            <footer className='sticky bottom-[var(--edg-footer-h,0px)] z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-border-default bg-bg-base/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6'>
              <div className='flex items-center gap-2'>
                {indice > 0 && (
                  <Button variant='secondary' onClick={() => vai(PASSI[indice - 1])} disabled={a.inCorso}>
                    Indietro
                  </Button>
                )}
                {a.passo === 'riepilogo' && a.nienteDaFare && (
                  <span className='text-sm text-text-secondary'>Niente di nuovo da aggiungere</span>
                )}
                {a.passo === 'settori' && a.primoAvvio && (
                  <Button variant='link' onClick={() => setDaZero(true)} disabled={a.inCorso}>
                    Parto da zero
                  </Button>
                )}
              </div>
              {a.passo === 'settori' && (
                <Button onClick={a.vaiAlleVoci} isLoading={a.inCorso} loadingText='Preparo la proposta…' disabled={!a.chiaviModelli.length}>
                  Avanti
                </Button>
              )}
              {a.passo === 'voci' && <Button onClick={() => vai('riepilogo')}>Avanti</Button>}
              {a.passo === 'riepilogo' && (
                <Button onClick={() => a.invia()} isLoading={a.inCorso} loadingText='Creo le voci…' disabled={a.nienteDaFare}>
                  {a.primoAvvio ? 'Avvia Vigilo' : 'Aggiungi le voci'}
                </Button>
              )}
            </footer>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={daZero}
        onClose={() => setDaZero(false)}
        onConfirm={async () => {
          await a.invia(true);
          setDaZero(false);
        }}
        title='Partire da zero?'
        message='Vigilo partirà senza categorie né controlli: li creerai tu, oppure li aggiungerai dalla libreria quando vuoi.'
        confirmText='Parto da zero'
        cancelText='Annulla'
        variant='info'
        isLoading={a.inCorso}
        loadingText='Preparo Vigilo…'
      />
    </div>
  );
};

export default AvvioPage;
