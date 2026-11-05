// src/features/vigilo/components/spese/RiquadriSpese.tsx
//
// I quattro riquadri di Spese e consumi: totale speso (con la variazione
// rispetto all'anno prima), fornitori esterni, manodopera interna (ore ed
// euro) e riparazioni (in rosso, con i guasti). Solo da leggere: i filtri
// stanno sopra. In fila da 1024 px, due per riga più stretti.
import React from 'react';
import { Skeleton, cn } from '@edg/ui';

import { COLORE_RIPARAZIONI } from '../../constants/resoconti';
import type { Spese } from '../../types/resoconti';
import { testoOre } from '../../utils/manodopera';
import { coloreVariazione, euroTondi, variazione, variazioneTesto } from '../../utils/resoconti';

const Confronto: React.FC<{ ora: number; prima: number }> = ({ ora, prima }) => {
  const v = variazione(ora, prima);
  if (v === null) return <>nessuna spesa l'anno prima</>;
  if (v === 0) return <>come l'anno prima</>;
  return (
    <>
      <span className={cn('font-bold', coloreVariazione(v))}>{variazioneTesto(v)}</span> rispetto all'anno prima
    </>
  );
};

interface Voce {
  etichetta: string;
  cifra: string;
  sotto: React.ReactNode;
  colore?: string;
}

function voci(d: Spese): Voce[] {
  const t = d.totale;
  return [
    { etichetta: 'Totale speso', cifra: euroTondi(t.spesa), sotto: <Confronto ora={t.spesa} prima={d.totalePrima.spesa} /> },
    { etichetta: 'Fornitori esterni', cifra: euroTondi(t.importi), sotto: `${t.conImporto} ${t.conImporto === 1 ? 'spesa' : 'spese'} con importo` },
    { etichetta: 'Manodopera interna', cifra: euroTondi(t.manodopera), sotto: t.ore ? `${testoOre(t.ore)} di lavoro interno` : 'nessuna ora registrata' },
    {
      etichetta: 'Riparazioni',
      cifra: euroTondi(d.riparazioni.spesa),
      sotto: (
        <>
          {d.riparazioni.guasti} {d.riparazioni.guasti === 1 ? 'guasto' : 'guasti'} · <Confronto ora={d.riparazioni.spesa} prima={d.riparazioni.spesaPrima} />
        </>
      ),
      colore: d.riparazioni.spesa ? COLORE_RIPARAZIONI : undefined,
    },
  ];
}

export const RiquadriSpese: React.FC<{ dati: Spese | null }> = ({ dati }) => (
  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
    {dati
      ? voci(dati).map(v => (
          <div key={v.etichetta} className='flex min-w-0 flex-col gap-1.5 rounded-lg border border-border-thin bg-bg-primary p-5'>
            <span className='text-base font-bold text-text-primary'>{v.etichetta}</span>
            <span className={cn('text-[40px] font-bold leading-tight tracking-tight tabular-nums', v.colore ?? 'text-text-primary')}>{v.cifra}</span>
            <span className='text-sm text-text-secondary'>{v.sotto}</span>
          </div>
        ))
      : Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className='h-32 w-full' />)}
  </div>
);
