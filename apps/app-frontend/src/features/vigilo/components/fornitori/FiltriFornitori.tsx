// src/features/vigilo/components/fornitori/FiltriFornitori.tsx
//
// Ricerca, tipo, stato e ordinamento dell'elenco dei fornitori (F1).
import React from 'react';
import { Select, cn } from '@edg/ui';

import { FILTRI_STATO_FORNITORI } from '../../constants/fornitori';
import type { ElencoFornitori } from '../../hooks/useElencoFornitori';
import type { OrdinaFornitori, StatoFornitori, TipoFornitore } from '../../types/fornitori';
import { CampoRicerca } from '../CampoRicerca';

const TUTTI = 'tutti';

const ORDINI: [OrdinaFornitori, string][] = [
  ['nome', 'Per nome'],
  ['tipo', 'Per tipo'],
];

export const FiltriFornitori: React.FC<{ e: ElencoFornitori; tipi: TipoFornitore[] }> = ({ e, tipi }) => (
  <div className='flex flex-wrap items-end gap-3'>
    <CampoRicerca valore={e.testo} onCambia={e.setTesto} segnaposto='Cerca per nome…' className='w-72' />
    {tipi.length > 0 && (
      <div className='w-52'>
        <Select
          optionSize='sm'
          label='Tipo'
          value={e.filtri.tipo ?? TUTTI}
          onValueChange={v => e.setFiltri({ ...e.filtri, tipo: v === TUTTI ? undefined : v })}
          options={[{ value: TUTTI, label: 'Tutti i tipi' }, ...tipi.map(t => ({ value: t.chiave, label: t.attivo ? t.nome : `${t.nome} (disattivato)` }))]}
        />
      </div>
    )}
    <div className='w-40'>
      <Select
        optionSize='sm'
        label='Stato'
        value={e.filtri.stato}
        onValueChange={v => e.setFiltri({ ...e.filtri, stato: v as StatoFornitori })}
        options={FILTRI_STATO_FORNITORI}
      />
    </div>
    <div className='flex h-10 items-center rounded-lg border border-border-default p-0.5 text-sm' role='group' aria-label='Ordina'>
      {ORDINI.map(([o, etichetta]) => (
        <button
          key={o}
          type='button'
          aria-pressed={e.ordina === o}
          onClick={() => e.setOrdina(o)}
          className={cn('h-full rounded-md px-3 transition-colors', e.ordina === o ? 'bg-action-primary text-action-primary-text' : 'text-text-secondary hover:bg-bg-hover')}
        >
          {etichetta}
        </button>
      ))}
    </div>
    {e.filtriAttivi && (
      <button type='button' onClick={e.azzera} className='inline-flex h-10 items-center px-2 text-sm text-text-link hover:underline'>
        Azzera filtri
      </button>
    )}
  </div>
);
