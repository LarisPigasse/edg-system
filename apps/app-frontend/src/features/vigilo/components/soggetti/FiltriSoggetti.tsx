// src/features/vigilo/components/soggetti/FiltriSoggetti.tsx
//
// Ricerca, categoria, sede, stato e ordinamento dell'elenco dei soggetti.
// La sede non compare per le sedi stesse e per l'azienda.
import React from 'react';
import { Select, cn } from '@edg/ui';

import { FILTRI_STATO } from '../../constants/statiSoggetto';
import type { StatoSoggetti } from '../../hooks/useSoggetti';
import type { FiltroStato, OrdinaSoggetti } from '../../types/soggetti';
import { CampoRicerca } from '../CampoRicerca';

const TUTTE = 'tutte';

const ORDINI: [OrdinaSoggetti, string][] = [
  ['urgenza', 'Per urgenza'],
  ['nome', 'Per nome'],
];

export const FiltriSoggetti: React.FC<{ s: StatoSoggetti }> = ({ s }) => {
  const conSede = s.tipo !== 'sede' && s.tipo !== 'azienda' && s.sedi.length > 0;
  const imposta = (chiave: 'categoria' | 'sede') => (v: string) => s.setFiltri({ ...s.filtri, [chiave]: v === TUTTE ? undefined : v });
  return (
    <div className='flex flex-wrap items-end gap-3'>
      <CampoRicerca valore={s.testo} onCambia={s.setTesto} segnaposto='Cerca per nome, targa, codice…' className='w-72' />
      {s.categorie.length > 0 && (
        <div className='w-52'>
          <Select
            optionSize='sm'
            label='Categoria'
            value={s.filtri.categoria ?? TUTTE}
            onValueChange={imposta('categoria')}
            options={[{ value: TUTTE, label: 'Tutte le categorie' }, ...s.categorie.map(c => ({ value: c.uuid, label: c.nome }))]}
          />
        </div>
      )}
      {conSede && (
        <div className='w-48'>
          <Select
            optionSize='sm'
            label='Sede'
            value={s.filtri.sede ?? TUTTE}
            onValueChange={imposta('sede')}
            options={[{ value: TUTTE, label: 'Tutte le sedi' }, ...s.sedi.map(x => ({ value: x.uuid, label: x.nome }))]}
          />
        </div>
      )}
      <div className='w-48'>
        <Select optionSize='sm' label='Stato' value={s.filtri.stato} onValueChange={v => s.setFiltri({ ...s.filtri, stato: v as FiltroStato })} options={FILTRI_STATO} />
      </div>
      <div className='flex h-10 items-center rounded-lg border border-border-default p-0.5 text-sm' role='group' aria-label='Ordina'>
        {ORDINI.map(([o, etichetta]) => (
          <button
            key={o}
            type='button'
            aria-pressed={s.ordina === o}
            onClick={() => s.setOrdina(o)}
            className={cn(
              'h-full rounded-md px-3 transition-colors',
              s.ordina === o ? 'bg-action-primary text-action-primary-text' : 'text-text-secondary hover:bg-bg-hover'
            )}
          >
            {etichetta}
          </button>
        ))}
      </div>
      {s.filtriAttivi && (
        <button type='button' onClick={s.azzera} className='inline-flex h-10 items-center px-2 text-sm text-text-link hover:underline'>
          Azzera filtri
        </button>
      )}
    </div>
  );
};
