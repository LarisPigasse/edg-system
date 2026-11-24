// src/features/vigilo/components/analisi/VistaAnalisi.tsx
//
// La terza vista della Dashboard (2026-11-23): "come sta andando, e che cosa
// conviene fare?". Numeri dell'azienda, non di un soggetto, solo per chi ha
// vigilo.costi. In testa da dove vengono i numeri e i dati che mancano (con
// il rimedio), poi i quattro riquadri chiave e i segnali "Da valutare" con le
// loro soglie (fase D); sotto, in due colonne, il costo
// pieno voce per voce e le stime contro la realtà; la flotta al lavoro
// (fase C); poi il conto dell'anno e i costi aziendali anno contro anno.
import React, { useState } from 'react';
import { Alert, Skeleton } from '@edg/ui';

import { useAnalisi } from '../../hooks/useAnalisi';
import { giornoBreve } from '../../utils/giorni';
import { ContoAnno } from './ContoAnno';
import { CostoPieno } from './CostoPieno';
import { DaValutare } from './DaValutare';
import { PannelloSoglie } from './PannelloSoglie';
import { FlottaAlLavoro } from './FlottaAlLavoro';
import { RiquadriAnalisi } from './RiquadriAnalisi';
import { StimeRealta } from './StimeRealta';
import { Struttura } from './Struttura';

export const VistaAnalisi: React.FC = () => {
  const { dati: a, errore, caricamento, aggiorna } = useAnalisi();
  const [soglie, setSoglie] = useState(false);

  if (errore)
    return (
      <Alert variant='danger' title='Impossibile leggere l’analisi'>
        {errore}
      </Alert>
    );
  if (!a || caricamento)
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className='h-36 rounded-lg' />
        ))}
      </div>
    );

  return (
    <div className='space-y-6'>
      <p className='text-sm text-text-secondary'>
        {a.anno ? `Costi aziendali del ${a.anno.anno} (${a.anno.stato})` : 'Nessun anno di costi aziendali'} · mezzi dal {giornoBreve(a.periodoMezzi.dal)} al {giornoBreve(a.periodoMezzi.al)}.
      </p>

      {a.avvisi.length > 0 && (
        <Alert variant='info' title='Dati che mancano'>
          <ul className='list-disc space-y-0.5 pl-4'>
            {a.avvisi.map(x => (
              <li key={x.chiave}>{x.testo}</li>
            ))}
          </ul>
        </Alert>
      )}

      <RiquadriAnalisi dati={a} />

      <DaValutare segnali={a.segnali} onSoglie={a.soglieModificabili ? () => setSoglie(true) : undefined} />

      <div className='grid items-start gap-6 xl:grid-cols-2'>
        <CostoPieno dati={a} />
        <StimeRealta dati={a} />
      </div>

      <FlottaAlLavoro dati={a.operativita} soglie={a.soglie} />

      <div className='grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]'>
        <ContoAnno dati={a} />
        <Struttura dati={a} />
      </div>

      <PannelloSoglie aperto={soglie} dati={a} onChiudi={() => setSoglie(false)} onSalvate={aggiorna} />
    </div>
  );
};
