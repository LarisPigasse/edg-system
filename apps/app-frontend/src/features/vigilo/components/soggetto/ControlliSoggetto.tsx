// src/features/vigilo/components/soggetto/ControlliSoggetto.tsx
//
// La scheda Controlli del soggetto (revisione 2026-11-11): i controlli
// attivi che valgono per lui, se si seguono, e lo storico delle decisioni
// con chi le ha prese. L'ufficio (write) può non seguirne uno, con il motivo
// obbligatorio, e tornare a seguirlo: le scadenze si chiudono e si riaprono
// di conseguenza (useControlliSoggetto).
import React, { useState } from 'react';
import { Alert, Button, Skeleton } from '@edg/ui';

import { useControlliSoggetto } from '../../hooks/useControlliSoggetto';
import { NATURE_TESTO } from '../../constants/nature';
import type { ControlloDelSoggetto, DecisioneControllo } from '../../types/controlliSoggetto';
import { aGiorno, giornoBreve } from '../../utils/giorni';
import { DecidiControllo, type Decisione } from './DecidiControllo';

interface Props {
  soggetto: string;
  puoModificare: boolean;
  /** Dopo una decisione: la scheda rilegge le scadenze */
  onCambiate?: () => void;
}

const giornoDi = (istante: string) => giornoBreve(aGiorno(new Date(istante)));
const da = (nome: string | null) => (nome ? ` da ${nome}` : '');

/** "11 nov 2026 · non seguito da Mario Rossi: esente" e, se c'è, la ripresa */
const righeDecisione = (d: DecisioneControllo): string[] => [
  `${giornoDi(d.decisaIl)} · non più seguito${da(d.decisaDa)}: ${d.motivo}`,
  ...(d.ripresaIl ? [`${giornoDi(d.ripresaIl)} · di nuovo seguito${da(d.ripresaDa)}${d.notaRipresa ? `: ${d.notaRipresa}` : ''}`] : []),
];

export const ControlliSoggetto: React.FC<Props> = ({ soggetto, puoModificare, onCambiate }) => {
  const c = useControlliSoggetto(soggetto, onCambiate);
  const [scelta, setScelta] = useState<{ controllo: ControlloDelSoggetto; decisione: Decisione } | null>(null);

  if (c.errore && !c.dati)
    return (
      <Alert variant='danger' title='Controlli non letti'>
        {c.errore}
      </Alert>
    );
  if (!c.dati) return <Skeleton className='h-32 w-full' />;

  const { controlli, decisioni } = c.dati;
  const nonSeguiti = controlli.filter(x => !x.seguito).length;

  return (
    <div className='space-y-6'>
      <section className='space-y-3' aria-label='Controlli che valgono per questo soggetto'>
        <header>
          <h3 className='text-sm font-semibold text-text-primary'>Controlli che valgono per questo soggetto</h3>
          <p className='text-xs text-text-secondary'>
            {controlli.length} {controlli.length === 1 ? 'controllo' : 'controlli'}
            {nonSeguiti ? `, ${nonSeguiti} non ${nonSeguiti === 1 ? 'seguito' : 'seguiti'}` : ', tutti seguiti'}. Un controllo non seguito non crea
            scadenze né avvisi per questo soggetto.
          </p>
        </header>
        {!controlli.length ? (
          <p className='text-sm text-text-secondary'>Nessun controllo attivo riguarda questo soggetto.</p>
        ) : (
          <ul className='divide-y divide-border-thin rounded-lg border border-border-default'>
            {controlli.map(x => (
              <li key={x.uuid} className='flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3'>
                <div className='min-w-0 flex-1'>
                  <p className='font-medium text-text-primary'>{x.nome}</p>
                  <p className='text-xs text-text-secondary'>
                    {NATURE_TESTO[x.natura]} · {x.automatico ? 'automatico' : 'si aggiunge a mano'}
                  </p>
                  {x.nonSeguito && (
                    <p className='mt-1 text-sm text-text-secondary'>
                      Non si segue{da(x.nonSeguito.da)} dal {giornoDi(x.nonSeguito.il)}: <span className='text-text-primary'>{x.nonSeguito.motivo}</span>
                    </p>
                  )}
                </div>
                <span className={x.seguito ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-text-secondary'}>
                  {x.seguito ? 'Si segue' : 'Non si segue'}
                </span>
                {puoModificare && (
                  <Button variant='outline' size='sm' onClick={() => setScelta({ controllo: x, decisione: x.seguito ? 'non-seguire' : 'riprendi' })}>
                    {x.seguito ? 'Non seguire' : 'Torna a seguire'}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {decisioni.length > 0 && (
        <section className='space-y-3' aria-label='Storico delle decisioni'>
          <h3 className='text-sm font-semibold text-text-primary'>Storico delle decisioni</h3>
          <ul className='divide-y divide-border-thin rounded-lg border border-border-default'>
            {decisioni.map(d => (
              <li key={d.uuid} className='px-4 py-3 text-sm'>
                <p className='font-medium text-text-primary'>{d.controllo.nome}</p>
                {righeDecisione(d).map(r => (
                  <p key={r} className='text-text-secondary'>
                    {r}
                  </p>
                ))}
              </li>
            ))}
          </ul>
        </section>
      )}

      <DecidiControllo
        controllo={scelta?.controllo ?? null}
        decisione={scelta?.decisione ?? 'non-seguire'}
        inCorso={c.inCorso}
        onChiudi={() => setScelta(null)}
        onConferma={testo =>
          scelta ? (scelta.decisione === 'non-seguire' ? c.nonSeguire(scelta.controllo, testo ?? '') : c.riprendi(scelta.controllo, testo)) : Promise.resolve(false)
        }
      />
    </div>
  );
};
