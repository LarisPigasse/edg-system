// src/features/vigilo/pages/MieScadenzePage.tsx
//
// "Le mie scadenze" dell'addetto (B9b, 07-interfaccia 7.10): la home di chi
// ha soltanto vigilo.own. Prima le sue (patente, visite, corsi), poi quelle
// dei mezzi che usa adesso, in schede grandi pensate per il telefono. Il clic
// apre il pannello: in sola lettura, con i documenti da caricare. Dalla
// campanella ci si arriva con ?scadenza= (e da un guasto appena segnalato,
// anche con &azione=segnala se già riparato). Senza persona collegata, il perché.
import React, { useCallback, useState } from 'react';
import { Alert, PageHeader, Skeleton } from '@edg/ui';

import { GruppoScadenze } from '../components/addetto/GruppoScadenze';
import type { Azione } from '../constants/azioni';
import { NonCollegato } from '../components/addetto/NonCollegato';
import { RichiedeAvvio } from '../components/RichiedeAvvio';
import { PannelloScadenza } from '../components/scadenza/PannelloScadenza';
import { useMieScadenze } from '../hooks/useMieScadenze';
import { useScadenzaDaIndirizzo } from '../hooks/useScadenzaDaIndirizzo';
import type { ProfiloVigilo } from '../types/io';
import { nomeProprio } from '../utils/testo';

const Contenuto: React.FC<{ profilo: ProfiloVigilo }> = ({ profilo }) => {
  const persona = profilo.persona;
  const m = useMieScadenze(persona?.uuid ?? null);
  const [aperta, setAperta] = useState<string | null>(null);
  const [pannello, setPannello] = useState(false);
  const [azione, setAzione] = useState<Azione | null>(null);
  const apri = useCallback((uuid: string, a: Azione | null = null) => {
    setAperta(uuid);
    setAzione(a);
    setPannello(true);
  }, []);
  useScadenzaDaIndirizzo(apri);

  if (!persona) return <NonCollegato />;

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Le mie scadenze'
        subtitle={`Ciao ${nomeProprio(persona.nome)}: qui trovi le tue scadenze e quelle dei mezzi che usi.`}
        onRefresh={() => void m.ricarica()}
      />
      {m.errore && !m.scadenze ? (
        <Alert variant='danger' title='Scadenze non lette'>
          {m.errore}
        </Alert>
      ) : !m.scadenze ? (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3'>
          {[0, 1, 2].map(i => (
            <Skeleton key={i} className='h-32 w-full' />
          ))}
        </div>
      ) : !m.scadenze.length ? (
        <p className='rounded-lg border border-dashed border-border-default p-6 text-center text-sm text-text-secondary'>
          Niente in scadenza: è tutto in regola.
        </p>
      ) : (
        <div className='space-y-8'>
          {m.mie.length > 0 && <GruppoScadenze titolo='Mie' voci={m.mie} onApri={apri} />}
          {m.mezzi.map(g => (
            <GruppoScadenze
              key={g.chiave}
              titolo={
                <>
                  {g.soggetto?.nome}
                  {g.soggetto?.identificativo && <span className='ml-2 font-mono normal-case'>{g.soggetto.identificativo}</span>}
                </>
              }
              voci={g.voci}
              onApri={apri}
            />
          ))}
        </div>
      )}
      <PannelloScadenza
        uuid={aperta}
        aperto={pannello}
        capacita={profilo.capacita}
        azioneIniziale={azione}
        onChiudi={() => setPannello(false)}
        onFatto={() => void m.ricarica()}
      />
    </div>
  );
};

const MieScadenzePage: React.FC = () => <RichiedeAvvio>{profilo => <Contenuto profilo={profilo} />}</RichiedeAvvio>;

export default MieScadenzePage;
