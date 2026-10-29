// src/features/vigilo/components/dashboard/FiltriDaFare.tsx
//
// Tipo, natura, sede e ordinamento delle cose "Da fare" (la ricerca sta
// in testa alla pagina). Valgono anche per i numeri della dashboard. Li usa
// anche il calendario, senza l'ordinamento.
import React from 'react';
import { Select, cn } from '@edg/ui';

import { NATURE_TESTO } from '../../constants/nature';
import { TIPI } from '../../constants/tipiSoggetto';
import type { FiltriScadenze, RiferimentoSoggetto } from '../../types/scadenze';
import { NATURE_FILTRO, TIPI_SOGGETTO, type NaturaEffettiva, type TipoSoggetto } from '../../types/valori';
import type { Ordina } from '../../hooks/useDashboard';

const TUTTI = 'tutti';

interface Props {
  filtri: Omit<FiltriScadenze, 'testo'>;
  onFiltri: (f: Omit<FiltriScadenze, 'testo'>) => void;
  sedi: RiferimentoSoggetto[];
  /** Assenti = niente scelta dell'ordine (es. nel calendario) */
  ordina?: Ordina;
  onOrdina?: (o: Ordina) => void;
  filtriAttivi: boolean;
  onAzzera: () => void;
}

const opzioni = <T extends string>(tutti: string, valori: readonly T[], etichetta: (v: T) => string) => [
  { value: TUTTI, label: tutti },
  ...valori.map(v => ({ value: v, label: etichetta(v) })),
];

export const FiltriDaFare: React.FC<Props> = ({ filtri, onFiltri, sedi, ordina, onOrdina, filtriAttivi, onAzzera }) => {
  const imposta = (chiave: keyof typeof filtri) => (v: string) => onFiltri({ ...filtri, [chiave]: v === TUTTI ? undefined : v });
  return (
    <div className='mb-5 flex flex-wrap items-end gap-3'>
      <div className='w-44'>
        <Select
          optionSize='sm'
          label='Tipo'
          value={filtri.tipo ?? TUTTI}
          onValueChange={imposta('tipo')}
          options={opzioni<TipoSoggetto>('Tutti i tipi', TIPI_SOGGETTO, t => TIPI[t].plurale)}
        />
      </div>
      <div className='w-44'>
        <Select optionSize='sm' label='Natura' value={filtri.natura ?? TUTTI} onValueChange={imposta('natura')} options={opzioni<NaturaEffettiva>('Tutte le nature', NATURE_FILTRO, n => NATURE_TESTO[n])} />
      </div>
      {sedi.length > 0 && (
        <div className='w-48'>
          <Select
            optionSize='sm'
            label='Sede'
            value={filtri.sede ?? TUTTI}
            onValueChange={imposta('sede')}
            options={[{ value: TUTTI, label: 'Tutte le sedi' }, ...sedi.map(s => ({ value: s.uuid, label: s.nome }))]}
          />
        </div>
      )}
      {ordina && onOrdina && (
        <div className='flex h-10 items-center rounded-lg border border-border-default p-0.5 text-sm' role='group' aria-label='Ordina'>
          {(['urgenza', 'soggetto'] as const).map(r => (
            <button
              key={r}
              type='button'
              aria-pressed={ordina === r}
              onClick={() => onOrdina(r)}
              className={cn('h-full rounded-md px-3 transition-colors', ordina === r ? 'bg-action-primary text-action-primary-text' : 'text-text-secondary hover:bg-bg-hover')}
            >
              Per {r}
            </button>
          ))}
        </div>
      )}
      {filtriAttivi && (
        <button type='button' onClick={onAzzera} className='inline-flex h-10 items-center gap-1 px-2 text-sm text-text-link hover:underline'>
          Azzera filtri
        </button>
      )}
    </div>
  );
};
