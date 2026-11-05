// src/features/vigilo/pages/MieiMezziPage.tsx
//
// "I miei mezzi" dell'addetto (B9b, 07-interfaccia 7.10): i mezzi che ha
// assegnati oggi, con i contatori per inserire subito km o ore. Una lettura
// sbagliata si corregge (solo le sue). Su ogni mezzo "Segnala un guasto"
// (B10a): poi si apre il guasto in Le mie scadenze (su Segnala fatto se è già
// riparato). Veicoli, macchine e attrezzature hanno anche "Rifornimento"
// (tappa 2) e gli ultimi rifornimenti, correggibili se suoi. Senza persona
// collegata, il perché.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Fuel, PageHeader, Skeleton, Wrench } from '@edg/ui';

import { NonCollegato } from '../components/addetto/NonCollegato';
import { SegnalaGuasto } from '../components/guasti/SegnalaGuasto';
import { ModuloRifornimento } from '../components/rifornimenti/ModuloRifornimento';
import { UltimiRifornimenti } from '../components/rifornimenti/UltimiRifornimenti';
import { TIPI_CON_RIFORNIMENTI } from '../constants/rifornimenti';
import { useModuloRifornimento } from '../hooks/useModuloRifornimento';
import type { Rifornimento } from '../types/rifornimenti';
import { etichettaStato } from '../constants/statiSoggetto';
import { RichiedeAvvio } from '../components/RichiedeAvvio';
import { Riquadro } from '../components/Riquadro';
import { CartaContatore } from '../components/soggetto/CartaContatore';
import { useMieiMezzi } from '../hooks/useMieiMezzi';
import type { ProfiloVigilo } from '../types/io';
import type { Soggetto } from '../types/soggetti';
import { TIPI_CON_GUASTI } from '../types/valori';

const Contenuto: React.FC<{ profilo: ProfiloVigilo }> = ({ profilo }) => {
  const m = useMieiMezzi(!!profilo.persona);
  const navigate = useNavigate();
  const [guasto, setGuasto] = useState<Soggetto | null>(null);
  const [aperto, setAperto] = useState(false);
  // il rifornimento: su quale mezzo, nuovo o da correggere; versione rilegge gli ultimi
  const [rif, setRif] = useState<{ mezzo: Soggetto; r: Rifornimento | null } | null>(null);
  const [rifAperto, setRifAperto] = useState(false);
  const [versione, setVersione] = useState(0);
  const moduloRif = useModuloRifornimento();
  if (!profilo.persona) return <NonCollegato />;

  const rifornisci = (mezzo: Soggetto, r: Rifornimento | null = null) => {
    setRif({ mezzo, r });
    setRifAperto(true);
  };
  const dopoRifornimento = () => {
    setVersione(v => v + 1);
    void m.ricarica();
  };

  const segnala = (s: Soggetto) => {
    setGuasto(s);
    setAperto(true);
  };

  return (
    <div className='space-y-6'>
      <PageHeader title='I miei mezzi' subtitle='I mezzi che usi in questo periodo: inserisci qui i chilometri o le ore.' onRefresh={() => void m.ricarica()} />
      {m.errore && !m.mezzi ? (
        <Alert variant='danger' title='Mezzi non letti'>
          {m.errore}
        </Alert>
      ) : !m.mezzi ? (
        <Skeleton className='h-48 w-full' />
      ) : !m.mezzi.length ? (
        <p className='rounded-lg border border-dashed border-border-default p-6 text-center text-sm text-text-secondary'>
          In questo momento non hai mezzi assegnati.
        </p>
      ) : (
        <div className='space-y-6'>
          {m.mezzi.map(s => (
            <section key={s.uuid} className='space-y-3'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <h2 className='flex flex-wrap items-center gap-x-2 text-lg font-semibold text-text-primary'>
                  {s.nome}
                  {s.identificativo && <span className='font-mono text-base text-text-secondary'>{s.identificativo}</span>}
                  {/* sospeso (anche per un guasto che blocca l'uso, B10a): non va usato */}
                  {s.stato === 'fermo' && <Badge variant='warning' size='xs' text={etichettaStato('fermo', s.tipo)} className='rounded-lg' />}
                </h2>
                <span className='flex flex-wrap gap-2'>
                  {s.stato !== 'dismesso' && TIPI_CON_RIFORNIMENTI.includes(s.tipo) && (
                    <Button size='sm' variant='secondary' leftIcon={<Fuel className='h-4 w-4' />} onClick={() => rifornisci(s)}>
                      Rifornimento
                    </Button>
                  )}
                  {s.stato !== 'dismesso' && TIPI_CON_GUASTI.includes(s.tipo) && (
                    <Button size='sm' variant='secondary' leftIcon={<Wrench className='h-4 w-4' />} onClick={() => segnala(s)}>
                      Segnala un guasto
                    </Button>
                  )}
                </span>
              </div>
              {s.contatori.length ? (
                <div className='grid gap-4 xl:grid-cols-2'>
                  {s.contatori.map(c => (
                    <CartaContatore
                      key={c.uuid}
                      c={c}
                      puoScrivere={s.stato !== 'dismesso'}
                      puoCorreggere={l => l.tua && l.fonte === 'manuale'}
                      onCambiato={() => void m.ricarica()}
                    />
                  ))}
                </div>
              ) : (
                <Riquadro titolo='Contatori'>
                  <p className='text-sm text-text-secondary'>Questo mezzo non ha contatori.</p>
                </Riquadro>
              )}
              {TIPI_CON_RIFORNIMENTI.includes(s.tipo) && (
                <UltimiRifornimenti
                  soggetto={s.uuid}
                  versione={versione}
                  onCorreggi={r => rifornisci(s, r)}
                  onElimina={async r => {
                    const ok = await moduloRif.elimina(r);
                    if (ok) void m.ricarica();
                    return ok;
                  }}
                />
              )}
            </section>
          ))}
        </div>
      )}
      {rif && (
        <ModuloRifornimento
          aperto={rifAperto}
          mezzo={rif.mezzo}
          rifornimento={rif.r}
          conFornitore={false}
          onChiudi={() => setRifAperto(false)}
          onSalvato={dopoRifornimento}
        />
      )}
      {guasto && (
        <SegnalaGuasto
          soggetto={guasto}
          aperto={aperto}
          giorniRiparazione={profilo.giorniRiparazione}
          perAddetto
          onChiudi={() => setAperto(false)}
          onSegnalato={(uuid, giaRiparato) => navigate(`/vigilo/mie-scadenze?scadenza=${uuid}${giaRiparato ? '&azione=segnala' : ''}`)}
        />
      )}
    </div>
  );
};

const MieiMezziPage: React.FC = () => <RichiedeAvvio>{profilo => <Contenuto profilo={profilo} />}</RichiedeAvvio>;

export default MieiMezziPage;
