// src/features/vigilo/components/aggiornamenti/PannelloAggiornamenti.tsx
//
// Il pannello degli aggiornamenti della libreria (B10b): l'elenco delle voci
// per tipo di soggetto, poi il dettaglio di una voce con le scelte. Aprire il
// dettaglio annota il "visto". Dopo una decisione si torna all'elenco; quando
// non resta niente il pannello si chiude. Con una sola voce si apre subito il
// suo dettaglio. La conferma della disattivazione sta nel piede del pannello:
// una finestra sopra il pannello farebbe chiudere il pannello al primo clic.
import React, { useEffect, useMemo, useState } from 'react';
import { Archive, Badge, Button, ChevronRight, LayoutGrid, ShieldCheck, Sheet } from '@edg/ui';

import { TIPI } from '../../constants/tipiSoggetto';
import type { ElencoAggiornamenti, Decisione, Scelta, VoceAggiornamento } from '../../types/aggiornamenti';
import type { TipoSoggetto } from '../../types/valori';
import { riassuntoVoce, scelteIniziali } from '../../utils/aggiornamenti';
import { DettaglioVoce } from './DettaglioVoce';

interface Props {
  elenco: ElencoAggiornamenti;
  aperto: boolean;
  inCorso: boolean;
  onChiudi: () => void;
  onVisto: (v: VoceAggiornamento) => void;
  onDecidi: (v: VoceAggiornamento, d: Decisione) => Promise<boolean>;
  /** La voce da aprire subito (dal segno sulla riga della Configurazione) */
  voceIniziale?: string | null;
}

const RigaVoce: React.FC<{ v: VoceAggiornamento; onApri: () => void }> = ({ v, onApri }) => (
  <li>
    <button type='button' onClick={onApri} className='flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-hover'>
      <span className='rounded-lg bg-bg-secondary p-2 text-text-secondary' aria-hidden>
        {v.tipo === 'ritiro' ? <Archive className='h-4 w-4' /> : v.entita === 'categoria' ? <LayoutGrid className='h-4 w-4' /> : <ShieldCheck className='h-4 w-4' />}
      </span>
      <span className='min-w-0 flex-1'>
        <span className='flex flex-wrap items-center gap-2'>
          <span className='font-medium text-text-primary'>{v.nome}</span>
          <span className='text-xs text-text-secondary'>{v.entita === 'categoria' ? 'categoria' : 'controllo'}</span>
          {v.tipo === 'ritiro' ? (
            <Badge variant='warning' size='xs' text={v.entita === 'controllo' ? 'ritirato' : 'ritirata'} className='rounded-lg' />
          ) : (
            !v.vistoIl && <Badge variant='info' size='xs' text='da vedere' className='rounded-lg' />
          )}
        </span>
        <span className='block truncate text-sm text-text-secondary'>{riassuntoVoce(v)}</span>
      </span>
      <ChevronRight className='h-4 w-4 shrink-0 text-text-secondary' aria-hidden />
    </button>
  </li>
);

export const PannelloAggiornamenti: React.FC<Props> = ({ elenco, aperto, inCorso, onChiudi, onVisto, onDecidi, voceIniziale = null }) => {
  const [scelta, setScelta] = useState<string | null>(null);
  const [scelte, setScelte] = useState<Record<string, Scelta>>({});
  const [conferma, setConferma] = useState(false);

  const unica = elenco.voci.length === 1 ? elenco.voci[0] : null;
  const voce = elenco.voci.find(v => v.uuid === scelta) ?? unica;

  // all'apertura: l'elenco (o l'unica voce); scelte proposte e "visto" per la voce aperta
  useEffect(() => {
    setScelta(aperto ? voceIniziale : null);
  }, [aperto, voceIniziale]);
  useEffect(() => {
    setConferma(false);
    if (!aperto || !voce) return;
    setScelte(scelteIniziali(voce.campi));
    onVisto(voce);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo quando cambia la voce aperta
  }, [aperto, voce?.uuid]);

  const gruppi = useMemo(() => {
    const m = new Map<TipoSoggetto, VoceAggiornamento[]>();
    for (const v of elenco.voci) m.set(v.tipoSoggetto, [...(m.get(v.tipoSoggetto) ?? []), v]);
    return [...m.entries()];
  }, [elenco.voci]);

  const decidi = async (d: Omit<Decisione, 'versione'>) => {
    if (!voce) return;
    const ok = await onDecidi(voce, { versione: voce.versioneA, ...d });
    if (!ok) return;
    setConferma(false);
    setScelta(null);
    if (elenco.voci.length <= 1) onChiudi();
  };
  const tuttiMiei = (v: VoceAggiornamento) => Object.fromEntries(v.campi.map(c => [c.campo, 'mio' as Scelta]));

  const piede = !voce ? (
    <Button variant='secondary' onClick={onChiudi}>
      Chiudi
    </Button>
  ) : voce.tipo === 'ritiro' && conferma ? (
    <>
      <p className='text-sm text-text-primary sm:mr-auto'>
        {voce.entita === 'controllo' ? 'Disattivarlo? Le sue scadenze aperte si chiudono.' : 'Disattivarla? Resta sui soggetti che la usano.'}
      </p>
      <Button variant='secondary' onClick={() => setConferma(false)} disabled={inCorso}>
        Annulla
      </Button>
      <Button variant='danger' onClick={() => void decidi({ ritiro: 'disattiva' })} isLoading={inCorso} loadingText='Un momento…'>
        Sì, disattiva
      </Button>
    </>
  ) : voce.tipo === 'ritiro' ? (
    <>
      <Button variant='secondary' onClick={() => void decidi({ ritiro: 'tieni' })} disabled={inCorso}>
        {voce.entita === 'controllo' ? 'Tienilo' : 'Tienila'}
      </Button>
      <Button variant='danger' onClick={() => setConferma(true)} disabled={inCorso}>
        {voce.entita === 'controllo' ? 'Disattivalo' : 'Disattivala'}
      </Button>
    </>
  ) : (
    <>
      {voce.campi.length > 0 && (
        <Button variant='secondary' onClick={() => void decidi({ scelte: tuttiMiei(voce) })} disabled={inCorso} className='sm:mr-auto'>
          Tieni tutti i tuoi valori
        </Button>
      )}
      <Button onClick={() => void decidi({ scelte })} isLoading={inCorso} loadingText='Applico…'>
        {voce.campi.length ? 'Applica le scelte' : 'Applica'}
      </Button>
    </>
  );

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title='Aggiornamenti della libreria'
      description='Le novità di EDG sulle voci che hai preso dalla libreria: decidi tu che cosa prendere.'
      className='w-full! sm:max-w-2xl!'
      footer={piede}
    >
      {voce ? (
        <DettaglioVoce
          v={voce}
          scelte={scelte}
          onScelta={(campo, s) => setScelte(x => ({ ...x, [campo]: s }))}
          onIndietro={unica ? undefined : () => setScelta(null)}
          inCorso={inCorso}
        />
      ) : elenco.voci.length ? (
        <div className='space-y-6'>
          {gruppi.map(([tipo, voci]) => {
            const Icona = TIPI[tipo].icona;
            return (
              <section key={tipo} className='space-y-2'>
                <h3 className='flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-secondary'>
                  <Icona className='h-4 w-4' aria-hidden />
                  {TIPI[tipo].plurale}
                </h3>
                <ul className='divide-y divide-border-thin overflow-hidden rounded-lg border border-border-default bg-bg-primary'>
                  {voci.map(v => (
                    <RigaVoce key={v.uuid} v={v} onApri={() => setScelta(v.uuid)} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <p className='text-sm text-text-secondary'>Niente da decidere: sei allineato alla libreria.</p>
      )}
    </Sheet>
  );
};
