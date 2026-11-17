// src/features/vigilo/pages/SoggettoPage.tsx
//
// La scheda di un soggetto (B7d-2): titolo "Soggetto › Nome", sotto tipo,
// identificativo e categoria; a destra il ritorno all'elenco (TornaAllElenco)
// e il refresh. Poi i riquadri di
// riepilogo con le azioni sullo stato accanto, e
// le schede Scadenze (con il pannello delle azioni), Controlli (quali si
// seguono, con lo storico delle decisioni, 2026-11-11), Storico, Contatori,
// Rifornimenti (veicoli, macchine e attrezzature, tappa 2), Assegnazioni,
// Documenti (B9a: del soggetto, delle sue scadenze, registrazioni e
// rifornimenti) e Dati. Modifica nel pannello laterale (B7d-3). Il modulo del
// rifornimento è uno solo, aperto dalla scheda o dal menu Azioni: dopo il
// salvataggio si rileggono soggetto (contatori), costo e rifornimenti.
// Un guasto segnalato dal menu Azioni riporta sulla scheda Scadenze e ne
// apre il pannello (B10a). Esporta (report, 2026-11-12): la scheda in PDF.
import React, { useState } from 'react';
import { Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Alert, ChevronRight, PageHeader, Skeleton, Tabs, type TabItem } from '@edg/ui';

import { AssegnazioniSoggetto } from '../components/soggetto/AssegnazioniSoggetto';
import { AzioniSoggetto } from '../components/soggetto/AzioniSoggetto';
import { CartaContatore } from '../components/soggetto/CartaContatore';
import { Documenti } from '../components/documenti/Documenti';
import { DatiSoggetto } from '../components/soggetto/DatiSoggetto';
import { RiepilogoSoggetto } from '../components/soggetto/RiepilogoSoggetto';
import { CostoDelMezzo } from '../components/costoMezzi/CostoDelMezzo';
import { MenuEsporta } from '../components/MenuEsporta';
import { useEsportaSchedaSoggetto } from '../hooks/useEsportaSchedaSoggetto';
import { ModuloRifornimento } from '../components/rifornimenti/ModuloRifornimento';
import { RifornimentiMezzo } from '../components/rifornimenti/RifornimentiMezzo';
import { TIPI_CON_RIFORNIMENTI } from '../constants/rifornimenti';
import { useModuloRifornimento } from '../hooks/useModuloRifornimento';
import type { Rifornimento } from '../types/rifornimenti';
import { TIPI_CON_POSSESSO } from '../constants/costoMezzi';
import { ScadenzeSoggetto } from '../components/soggetto/ScadenzeSoggetto';
import { StoricoSoggetto } from '../components/soggetto/StoricoSoggetto';
import { ControlliSoggetto } from '../components/soggetto/ControlliSoggetto';
import { TornaAllElenco } from '../components/TornaAllElenco';
import { useProfiloVigilo } from '../hooks/useProfiloVigilo';
import { useSoggetto } from '../hooks/useSoggetto';
import { eAddetto } from '../utils/capacita';

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
  const { search } = useLocation();
  const { profilo } = useProfiloVigilo();
  const addetto = !!profilo && eAddetto(profilo.capacita);
  const x = useSoggetto(addetto ? '' : id);
  const s = x.soggetto;
  const capacita = profilo?.capacita;
  const [, setParametri] = useSearchParams();
  /** Cambia per riaprire le schede su Scadenze */
  const [giro, setGiro] = useState(0);
  // il modulo del rifornimento: nuovo (null) o da correggere; versione rilegge elenco e costo
  const [rifornimento, setRifornimento] = useState<{ aperto: boolean; r: Rifornimento | null }>({ aperto: false, r: null });
  const [versione, setVersione] = useState(0);
  const moduloRif = useModuloRifornimento();
  const conRifornimenti = !!s && TIPI_CON_RIFORNIMENTI.includes(s.tipo);
  const puoRegistrare = !!capacita?.write && s?.stato !== 'dismesso';
  const dopoRifornimento = () => {
    setVersione(v => v + 1);
    void x.ricarica();
  };

  // il guasto appena segnalato: si torna su Scadenze e se ne apre il pannello (su Registra se già riparato)
  const dopoGuasto = (uuid: string, giaRiparato: boolean) => {
    void x.ricarica();
    setGiro(g => g + 1);
    setParametri(giaRiparato ? { scadenza: uuid, azione: 'registra' } : { scadenza: uuid });
  };

  const schede: TabItem[] = s
    ? [
        {
          id: 'scadenze',
          label: <Conteggio testo='Scadenze' n={x.scadenze.length} />,
          content: capacita && (
            <ScadenzeSoggetto scadenze={x.scadenze} capacita={capacita} onCambiate={() => void x.ricarica()} />
          ),
        },
        {
          id: 'controlli',
          label: 'Controlli',
          content: <ControlliSoggetto soggetto={s.uuid} puoModificare={!!capacita?.write} onCambiate={() => void x.ricarica()} />,
        },
        { id: 'storico', label: 'Storico', content: <StoricoSoggetto soggetto={s.uuid} nome={s.nome} conCosti={!!capacita?.costi} /> },
        ...(s.contatori.length
          ? [
              {
                id: 'contatori',
                label: <Conteggio testo='Contatori' n={s.contatori.length} />,
                content: (
                  // un contatore per riga, a tutta larghezza: grafico e letture affiancati (2026-11-16)
                  <div className='space-y-4'>
                    {s.contatori.map(c => (
                      <CartaContatore
                        key={c.uuid}
                        c={c}
                        puoScrivere={!!capacita?.write && s.stato !== 'dismesso'}
                        puoCorreggere={l => !!capacita?.write && l.fonte === 'manuale'}
                        onCambiato={() => void x.ricarica()}
                      />
                    ))}
                  </div>
                ),
              },
            ]
          : []),
        ...(conRifornimenti
          ? [
              {
                id: 'rifornimenti',
                label: 'Rifornimenti',
                content: (
                  <RifornimentiMezzo
                    soggetto={s.uuid}
                    nome={s.nome}
                    conImporto={!!capacita?.costi}
                    puoRegistrare={puoRegistrare}
                    versione={versione}
                    onRegistra={() => setRifornimento({ aperto: true, r: null })}
                    onCorreggi={r => setRifornimento({ aperto: true, r })}
                    onElimina={async r => {
                      const ok = await moduloRif.elimina(r);
                      if (ok) dopoRifornimento();
                      return ok;
                    }}
                  />
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
  const scheda = useEsportaSchedaSoggetto(x, !!capacita?.costi);

  // l'addetto arriva qui dai collegamenti delle email: la sua scadenza è in "Le mie scadenze" (B9b)
  if (addetto) return <Navigate to={`/vigilo/mie-scadenze${search}`} replace />;

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
            trailingActions={
              <div className='flex items-center gap-2'>
                {/* report (2026-11-12): la scheda in PDF */}
                <MenuEsporta voci={[{ id: 'scheda', label: 'Scheda del soggetto (PDF)', onClick: () => void scheda.esporta() }]} inCorso={scheda.inCorso} />
                {elenco}
              </div>
            }
          />
          {/* due colonne dai 1280 px (2026-11-16): a sinistra, stretta (30rem, scelta dall'utente), riquadri e costo;
              il resto alle schede. Sotto i 1280 px una dopo l'altra */}
          <div className='grid items-start gap-6 xl:grid-cols-[30rem_minmax(0,1fr)]'>
            <div className='space-y-6'>
              <RiepilogoSoggetto s={s} />
              {/* costo dei mezzi: solo veicoli, macchine e attrezzature, solo con vigilo.costi; si rilegge dopo una modifica */}
              {capacita?.costi && TIPI_CON_POSSESSO.includes(s.tipo) && (
                <CostoDelMezzo uuid={s.uuid} nome={s.nome} chiave={`${s.modificatoIl}:${versione}`} possesso={s.possesso} />
              )}
            </div>
            <div className='min-w-0'>
              <Tabs
                key={giro}
                items={schede}
                defaultTab='scadenze'
                actions={
                  capacita?.write &&
                  profilo && (
                    <AzioniSoggetto
                      s={s}
                      inCorso={x.inCorso}
                      onStato={x.cambiaStato}
                      onModifica={x.modifica}
                      scadenze={x.scadenze}
                      onAggiungi={x.aggiungiScadenza}
                      onRicarica={() => void x.ricarica()}
                      giorniRiparazione={profilo.giorniRiparazione}
                      onGuasto={dopoGuasto}
                      onRifornimento={conRifornimenti ? () => setRifornimento({ aperto: true, r: null }) : undefined}
                    />
                  )
                }
              />
            </div>
          </div>
          {conRifornimenti && (
            <ModuloRifornimento
              aperto={rifornimento.aperto}
              mezzo={s}
              rifornimento={rifornimento.r}
              conFornitore={!!capacita?.write}
              onChiudi={() => setRifornimento(v => ({ ...v, aperto: false }))}
              onSalvato={dopoRifornimento}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SoggettoPage;
