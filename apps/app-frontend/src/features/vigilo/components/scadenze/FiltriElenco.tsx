// src/features/vigilo/components/scadenze/FiltriElenco.tsx
//
// Ricerca, stato (aperte, uno stato, chiuse), tipo, natura, controllo, sede e
// ordinamento dell'elenco delle scadenze. I controlli con lo stesso nome (in
// categorie diverse) sono una voce sola, come in dashboard.
import React from 'react';
import { Select, cn } from '@edg/ui';

import { FILTRI_STATO_SCADENZE, ORDINI_SCADENZE } from '../../constants/elencoScadenze';
import { NATURE_TESTO } from '../../constants/nature';
import { TIPI } from '../../constants/tipiSoggetto';
import type { StatoElencoScadenze } from '../../hooks/useElencoScadenze';
import type { FiltroStatoScadenze } from '../../types/scadenze';
import { NATURE, TIPI_SOGGETTO, type Natura, type TipoSoggetto } from '../../types/valori';
import { CampoRicerca } from '../CampoRicerca';

const TUTTI = 'tutti';

/** Gli uuid in ordine fisso: lo stesso gruppo di controlli ha sempre lo stesso valore (anche se arriva dalla dashboard) */
const gruppo = (uuids: string) => uuids.split(',').sort().join(',');

export const FiltriElenco: React.FC<{ e: StatoElencoScadenze }> = ({ e }) => {
  const f = e.filtri;
  const scegli = <K extends 'tipo' | 'natura' | 'controllo' | 'sede'>(k: K) => (v: string) => e.setFiltri({ ...f, [k]: v === TUTTI ? undefined : v });

  // un'opzione per nome: il valore sono gli uuid di tutti i controlli con quel nome
  const perNome = new Map<string, string[]>();
  for (const c of e.controlli.filter(c => !f.tipo || c.tipoSoggetto === f.tipo)) perNome.set(c.nome, [...(perNome.get(c.nome) ?? []), c.uuid]);
  const controlli = [...perNome].map(([nome, uuids]) => ({ value: gruppo(uuids.join(',')), label: nome }));
  const chiuse = f.stato === 'chiuse';

  return (
    <div className='flex flex-wrap items-end gap-3'>
      <CampoRicerca valore={e.testo} onCambia={e.setTesto} segnaposto='Cerca scadenza, soggetto, targa…' className='w-72' />
      <div className='w-44'>
        <Select
          optionSize='sm'
          label='Stato'
          value={f.stato}
          onValueChange={v => e.setFiltri({ ...f, stato: v as FiltroStatoScadenze })}
          options={FILTRI_STATO_SCADENZE}
        />
      </div>
      <div className='w-40'>
        <Select
          optionSize='sm'
          label='Tipo'
          value={f.tipo ?? TUTTI}
          onValueChange={v => e.setFiltri({ ...f, tipo: v === TUTTI ? undefined : (v as TipoSoggetto), controllo: undefined })}
          options={[{ value: TUTTI, label: 'Tutti i tipi' }, ...TIPI_SOGGETTO.map(t => ({ value: t, label: TIPI[t].plurale }))]}
        />
      </div>
      <div className='w-40'>
        <Select
          optionSize='sm'
          label='Natura'
          value={f.natura ?? TUTTI}
          onValueChange={scegli('natura')}
          options={[{ value: TUTTI, label: 'Tutte le nature' }, ...NATURE.map((n: Natura) => ({ value: n, label: NATURE_TESTO[n] }))]}
        />
      </div>
      {controlli.length > 0 && (
        <div className='w-52'>
          <Select
            optionSize='sm'
            label='Controllo'
            value={f.controllo ? gruppo(f.controllo) : TUTTI}
            onValueChange={scegli('controllo')}
            options={[{ value: TUTTI, label: 'Tutti i controlli' }, ...controlli]}
          />
        </div>
      )}
      {e.sedi.length > 0 && (
        <div className='w-44'>
          <Select
            optionSize='sm'
            label='Sede'
            value={f.sede ?? TUTTI}
            onValueChange={scegli('sede')}
            options={[{ value: TUTTI, label: 'Tutte le sedi' }, ...e.sedi.map(s => ({ value: s.uuid, label: s.nome }))]}
          />
        </div>
      )}
      {!chiuse && (
        <div className='flex h-10 items-center rounded-lg border border-border-default p-0.5 text-sm' role='group' aria-label='Ordina'>
          {ORDINI_SCADENZE.map(([o, etichetta]) => (
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
      )}
      {e.filtriAttivi && (
        <button type='button' onClick={e.azzera} className='inline-flex h-10 items-center px-2 text-sm text-text-link hover:underline'>
          Azzera filtri
        </button>
      )}
    </div>
  );
};
