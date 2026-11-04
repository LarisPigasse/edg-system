// src/features/vigilo/components/spese/FiltriSpese.tsx
//
// Periodo (con le date se personalizzato), tipo di soggetto e sede della vista
// Spese e consumi; a destra il periodo guardato e quello di confronto.
import React from 'react';
import { DatePicker, Select } from '@edg/ui';

import { PERIODI_SPESE } from '../../constants/resoconti';
import { TIPI } from '../../constants/tipiSoggetto';
import type { StatoSpese } from '../../hooks/useSpese';
import type { PeriodoSpese } from '../../types/resoconti';
import type { RiferimentoSoggetto } from '../../types/scadenze';
import { TIPI_SOGGETTO, type TipoSoggetto } from '../../types/valori';
import { aGiorno, daGiorno, oggiLocale } from '../../utils/giorni';
import { periodoTesto } from '../../utils/resoconti';

const TUTTI = 'tutti';

export const FiltriSpese: React.FC<{ s: StatoSpese; sedi: RiferimentoSoggetto[] }> = ({ s, sedi }) => {
  const f = s.filtri;
  const imposta = (cambi: Partial<typeof f>) => s.setFiltri({ ...f, ...cambi });
  return (
    <div className='flex flex-wrap items-end gap-3'>
      <div className='w-48'>
        <Select optionSize='sm' label='Periodo' value={f.periodo} onValueChange={v => imposta({ periodo: v as PeriodoSpese })} options={PERIODI_SPESE} />
      </div>
      {f.periodo === 'personalizzato' && (
        <>
          <div className='w-44'>
            <DatePicker label='Dal' value={f.dal ? daGiorno(f.dal) : undefined} onChange={d => imposta({ dal: d ? aGiorno(d) : undefined })} maxDate={daGiorno(oggiLocale())} />
          </div>
          <div className='w-44'>
            <DatePicker label='Al' value={f.al ? daGiorno(f.al) : undefined} onChange={d => imposta({ al: d ? aGiorno(d) : undefined })} maxDate={daGiorno(oggiLocale())} />
          </div>
        </>
      )}
      <div className='w-48'>
        <Select
          optionSize='sm'
          label='Tipo di soggetto'
          value={f.tipo ?? TUTTI}
          onValueChange={v => imposta({ tipo: v === TUTTI ? undefined : (v as TipoSoggetto) })}
          options={[{ value: TUTTI, label: 'Tutti i tipi' }, ...TIPI_SOGGETTO.map(t => ({ value: t, label: TIPI[t].plurale }))]}
        />
      </div>
      {sedi.length > 0 && (
        <div className='w-48'>
          <Select
            optionSize='sm'
            label='Sede'
            value={f.sede ?? TUTTI}
            onValueChange={v => imposta({ sede: v === TUTTI ? undefined : v })}
            options={[{ value: TUTTI, label: 'Tutte le sedi' }, ...sedi.map(x => ({ value: x.uuid, label: x.nome }))]}
          />
        </div>
      )}
      {s.dati && !s.avvisoDate && (
        <p className='pb-2.5 text-sm text-text-secondary'>
          {periodoTesto(s.dati.periodo)} · confronto con {periodoTesto(s.dati.confronto)}
        </p>
      )}
    </div>
  );
};
