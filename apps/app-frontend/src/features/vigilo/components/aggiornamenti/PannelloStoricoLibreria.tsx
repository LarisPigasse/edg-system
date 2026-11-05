// src/features/vigilo/components/aggiornamenti/PannelloStoricoLibreria.tsx
//
// Lo Storico della libreria di un controllo o di una categoria (B10b, ADR074): ogni scelta fatta
// sulla voce, dalla più recente all'avvio. Per ogni riga che cosa e quando è
// stato proposto, quando è stato visto, chi ha deciso e campo per campo che
// cosa è stato preso o tenuto. Le righe non si modificano: è il registro.
import React from 'react';
import { Alert, Button, Sheet, Skeleton } from '@edg/ui';

import { useStoricoLibreria } from '../../hooks/useStoricoLibreria';
import type { EntitaAggiornamento, RigaStoricoLibreria } from '../../types/aggiornamenti';
import { etichettaCampo, fraseCampoDeciso, titoloStorico } from '../../utils/aggiornamenti';
import { istanteEsteso } from '../../utils/giorni';

interface Props {
  entita: EntitaAggiornamento;
  voce: { uuid: string; nome: string } | null;
  aperto: boolean;
  onChiudi: () => void;
}

const versione = (r: RigaStoricoLibreria) =>
  r.versioneDa && r.versioneDa !== r.versioneA ? `versione ${r.versioneDa} → ${r.versioneA}` : `versione ${r.versioneA}`;

const Riga: React.FC<{ r: RigaStoricoLibreria; entita: EntitaAggiornamento }> = ({ r, entita }) => {
  const campi = r.campi.filter(c => c.campo !== 'ritirata');
  return (
    <li className='space-y-2 px-4 py-3'>
      <div className='flex flex-wrap items-baseline justify-between gap-x-3'>
        <span className='font-medium text-text-primary'>{titoloStorico(r, entita)}</span>
        <span className='text-xs text-text-secondary'>{versione(r)}</span>
      </div>
      <p className='text-xs text-text-secondary'>
        {[istanteEsteso(r.decisoIl), r.decisoDa, r.contesto === 'aggiornamento' && r.vistoIl ? `aperto il ${istanteEsteso(r.vistoIl)}` : null]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {r.novita && <p className='rounded-lg bg-bg-secondary px-3 py-2 text-xs text-text-secondary'>{r.novita}</p>}
      {campi.length > 0 && (
        <ul className='space-y-1 text-sm'>
          {campi.map(c => (
            <li key={c.campo}>
              <span className='font-medium text-text-primary'>{etichettaCampo(c.campo)}</span>{' '}
              <span className='text-text-secondary'>— {fraseCampoDeciso(c)}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export const PannelloStoricoLibreria: React.FC<Props> = ({ entita, voce, aperto, onChiudi }) => {
  const { righe, errore, caricamento } = useStoricoLibreria(entita, aperto ? (voce?.uuid ?? null) : null);
  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title='Storico della libreria'
      description={voce ? `${voce.nome}: le scelte fatte sulle proposte di EDG, dalla più recente.` : undefined}
      className='w-full! sm:max-w-xl!'
      footer={
        <Button variant='secondary' onClick={onChiudi}>
          Chiudi
        </Button>
      }
    >
      {errore && (
        <Alert variant='danger' title='Impossibile leggere lo storico'>
          {errore}
        </Alert>
      )}
      {caricamento && <Skeleton className='h-32 rounded-lg' />}
      {righe &&
        (righe.length ? (
          <ul className='divide-y divide-border-thin overflow-hidden rounded-lg border border-border-default bg-bg-primary'>
            {righe.map(r => (
              <Riga key={r.uuid} r={r} entita={entita} />
            ))}
          </ul>
        ) : (
          <p className='text-sm text-text-secondary'>Nessuna decisione registrata per questa voce.</p>
        ))}
    </Sheet>
  );
};
