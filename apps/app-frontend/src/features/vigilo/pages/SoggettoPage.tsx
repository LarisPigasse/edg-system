// src/features/vigilo/pages/SoggettoPage.tsx
//
// La scheda di un soggetto (B7d-2): titolo "Soggetto › Nome", sotto tipo,
// identificativo e categoria; a destra il ritorno all'elenco (TornaAllElenco)
// e il refresh. Poi i riquadri di
// riepilogo con le azioni sullo stato accanto, e
// le schede Scadenze (con il pannello delle azioni), Storico, Contatori,
// Assegnazioni, Documenti (B9a: del soggetto, delle sue scadenze e
// registrazioni) e Dati. Modifica nel pannello laterale (B7d-3).
import React from 'react';
import { useParams } from 'react-router-dom';
import { Alert, ChevronRight, PageHeader, Skeleton, Tabs, type TabItem } from '@edg/ui';

import { AssegnazioniSoggetto } from '../components/soggetto/AssegnazioniSoggetto';
import { AzioniSoggetto } from '../components/soggetto/AzioniSoggetto';
import { CartaContatore } from '../components/soggetto/CartaContatore';
import { Documenti } from '../components/documenti/Documenti';
import { DatiSoggetto } from '../components/soggetto/DatiSoggetto';
import { RiepilogoSoggetto } from '../components/soggetto/RiepilogoSoggetto';
import { ScadenzeSoggetto } from '../components/soggetto/ScadenzeSoggetto';
import { StoricoSoggetto } from '../components/soggetto/StoricoSoggetto';
import { TornaAllElenco } from '../components/TornaAllElenco';
import { useProfiloVigilo } from '../hooks/useProfiloVigilo';
import { useSoggetto } from '../hooks/useSoggetto';

/** Hanno assegnazioni i mezzi (chi li usa) e le persone (che cosa usano) */
const CON_ASSEGNAZIONI = ['veicolo', 'macchina', 'attrezzatura', 'persona'];

/** "Soggetto › Iveco Stralis": la sezione nel colore dei titoli, il nome in nero */
const Titolo: React.FC<{ nome: string }> = ({ nome }) => (
  <span className='inline-flex min-w-0 flex-wrap items-center gap-x-2'>
    Soggetto
    <ChevronRight className='h-6 w-6 shrink-0 text-text-secondary' aria-hidden />
    <span className='text-text-primary'>{nome}</span>
  </span>
);

const Conteggio: React.FC<{ testo: string; n: number }> = ({ testo, n }) => (
  <span className='inline-flex items-center gap-2'>
    {testo}
    <span className='rounded-full bg-bg-secondary px-2 py-0.5 text-xs font-semibold tabular-nums text-text-secondary'>{n}</span>
  </span>
);

const SoggettoPage: React.FC = () => {
  const { id = '' } = useParams();
  const { profilo } = useProfiloVigilo();
  const x = useSoggetto(id);
  const s = x.soggetto;
  const capacita = profilo?.capacita;

  const schede: TabItem[] = s
    ? [
        {
          id: 'scadenze',
          label: <Conteggio testo='Scadenze' n={x.scadenze.length} />,
          content: capacita && (
            <ScadenzeSoggetto scadenze={x.scadenze} capacita={capacita} onCambiate={() => void x.ricarica()} />
          ),
        },
        { id: 'storico', label: 'Storico', content: <StoricoSoggetto soggetto={s.uuid} /> },
        ...(s.contatori.length
          ? [
              {
                id: 'contatori',
                label: <Conteggio testo='Contatori' n={s.contatori.length} />,
                content: (
                  <div className='grid gap-4 xl:grid-cols-2'>
                    {s.contatori.map(c => (
                      <CartaContatore
                        key={c.uuid}
                        c={c}
                        puoScrivere={!!capacita?.write && s.stato !== 'dismesso'}
                        onCambiato={() => void x.ricarica()}
                      />
                    ))}
                  </div>
                ),
              },
            ]
          : []),
        ...(CON_ASSEGNAZIONI.includes(s.tipo)
          ? [
              {
                id: 'assegnazioni',
                label: 'Assegnazioni',
                content: <AssegnazioniSoggetto uuid={s.uuid} comePersona={s.tipo === 'persona'} />,
              },
            ]
          : []),
        {
          id: 'documenti',
          label: 'Documenti',
          content: <Documenti entita='soggetto' id={s.uuid} puoModificare={!!capacita?.write && s.stato !== 'dismesso'} />,
        },
        { id: 'dati', label: 'Dati', content: <DatiSoggetto s={s} campi={x.campi} /> },
      ]
    : [];

  const elenco = <TornaAllElenco tipo={s?.tipo} />;

  return (
    <div className='space-y-6'>
      {x.errore && !s ? (
        <>
          <PageHeader title='Soggetto' trailingActions={elenco} />
          <Alert variant='danger' title='Impossibile leggere il soggetto'>
            {x.errore}
          </Alert>
        </>
      ) : !s ? (
        <div className='space-y-4'>
          <Skeleton className='h-16 w-1/2' />
          <Skeleton className='h-20 w-full' />
          <Skeleton className='h-64 w-full' />
        </div>
      ) : (
        <>
          <PageHeader
            title={<Titolo nome={s.nome} />}
            onRefresh={() => void x.ricarica()}
            isLoading={x.caricamento}
            trailingActions={elenco}
          />
          <RiepilogoSoggetto s={s} />
          <Tabs
            items={schede}
            defaultTab='scadenze'
            actions={
              capacita?.write && (
                <AzioniSoggetto
                  s={s}
                  inCorso={x.inCorso}
                  onStato={x.cambiaStato}
                  onModifica={x.modifica}
                  scadenze={x.scadenze}
                  onAggiungi={x.aggiungiScadenza}
                />
              )
            }
          />
        </>
      )}
    </div>
  );
};

export default SoggettoPage;
