// src/features/vigilo/components/avvisi/ElencoAvvisi.tsx
//
// La scheda Avvisi di Vigilo › Avvisi (B8d-1): stato e tipo di soggetto in
// alto con "Segna tutti come letti", poi gli avvisi dal più recente, a
// pagine da 32. Ogni voce è la riga degli avvisi della piattaforma.
import React from 'react';
import { Alert, Button, Select, Skeleton } from '@edg/ui';

import { NotificationRow } from '../../../../core/notifications';
import { STATI_ELENCO_AVVISI } from '../../constants/avvisi';
import { TIPI } from '../../constants/tipiSoggetto';
import type { StatoMieiAvvisi } from '../../hooks/useMieiAvvisi';
import type { StatoElencoAvvisi } from '../../types/avvisi';
import { TIPI_SOGGETTO, type TipoSoggetto } from '../../types/valori';
import { notificaDi } from '../../utils/avvisi';

const TUTTI = 'tutti';

/** "12 avvisi · 3 da leggere" */
const conteggio = (totale: number, nonLetti: number) =>
  [`${totale} ${totale === 1 ? 'avviso' : 'avvisi'}`, nonLetti ? `${nonLetti} da leggere` : null].filter(Boolean).join(' · ');

export const ElencoAvvisi: React.FC<{ e: StatoMieiAvvisi; base: string }> = ({ e, base }) => {
  const f = e.filtri;
  const vuoto = STATI_ELENCO_AVVISI.find(s => s.value === f.stato)?.vuoto ?? STATI_ELENCO_AVVISI[0].vuoto;

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-end gap-3'>
        <div className='w-44'>
          <Select
            optionSize='sm'
            label='Quali'
            value={f.stato}
            onValueChange={v => e.setFiltri({ ...f, stato: v as StatoElencoAvvisi })}
            options={STATI_ELENCO_AVVISI.map(({ value, label }) => ({ value, label }))}
          />
        </div>
        <div className='w-44'>
          <Select
            optionSize='sm'
            label='Tipo'
            value={f.tipo ?? TUTTI}
            onValueChange={v => e.setFiltri({ ...f, tipo: v === TUTTI ? undefined : (v as TipoSoggetto) })}
            options={[{ value: TUTTI, label: 'Tutti i tipi' }, ...TIPI_SOGGETTO.map(t => ({ value: t, label: TIPI[t].plurale }))]}
          />
        </div>
        {/* il conteggio solo a dati arrivati: niente "0 avvisi" mentre carica */}
        {!(e.caricamento && !e.voci.length) && <p className='pb-2 text-sm text-text-secondary'>{conteggio(e.totale, e.nonLetti)}</p>}
        <div className='ml-auto pb-0.5'>
          <Button variant='secondary' size='sm' onClick={() => void e.segnaTutti()} disabled={!e.nonLetti}>
            Segna tutti come letti
          </Button>
        </div>
      </div>

      {e.errore && (
        <Alert variant='danger' title='Impossibile leggere gli avvisi'>
          {e.errore}
        </Alert>
      )}

      <div className='overflow-hidden rounded-lg border border-border-default bg-bg-primary'>
        {e.caricamento && !e.voci.length ? (
          <div className='space-y-4 p-4'>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className='space-y-1.5'>
                <Skeleton className='h-4 w-1/2' />
                <Skeleton className='h-3 w-1/3' />
              </div>
            ))}
          </div>
        ) : !e.voci.length ? (
          <p className='px-4 py-8 text-center text-sm text-text-secondary'>{vuoto}</p>
        ) : (
          <ul className='divide-y divide-border-thin'>
            {e.voci.map(v => (
              <NotificationRow key={v.uuid} n={notificaDi(v, base)} onOpen={() => e.segnaLetto(v)} />
            ))}
          </ul>
        )}
      </div>

      {e.altri && (
        <div className='flex justify-center'>
          <Button variant='secondary' onClick={() => void e.mostraAltri()} isLoading={e.caricamento} loadingText='Carico…'>
            Mostra altri ({e.totale - e.voci.length})
          </Button>
        </div>
      )}
    </div>
  );
};
