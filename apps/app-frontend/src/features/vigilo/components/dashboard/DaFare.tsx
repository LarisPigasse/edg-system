// src/features/vigilo/components/dashboard/DaFare.tsx
//
// Le cose da fare come schede colorate della stessa misura, che riempiono lo
// spazio disponibile (griglia a riempimento). Nella vista di partenza le
// scadenze senza data non si mostrano una per una: una scheda le riassume e
// apre la loro vista, così non coprono le cose urgenti. Un clic su una
// scheda apre il pannello della scadenza (onApri). Esporta PDF a destra dei
// filtri: la vista scelta con i suoi filtri (useDashboard.esportaPdf).
import React from 'react';
import { Button, ExportPdfAction, Skeleton } from '@edg/ui';

import { FASCE_ASPETTO } from '../../constants/fasce';
import { fasciaDi } from '../../utils/fasce';
import { Riquadro } from '../Riquadro';
import type { RiferimentoSoggetto } from '../../types/scadenze';
import { FiltriDaFare } from './FiltriDaFare';
import { SchedaScadenza } from './SchedaScadenza';
import type { StatoDashboard } from '../../hooks/useDashboard';
import { DEFINIZIONI } from '../../constants/viste';

const GRIGLIA = 'grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3';

interface Props {
  d: StatoDashboard;
  sedi: RiferimentoSoggetto[];
  onApri: (uuid: string) => void;
}

export const DaFare: React.FC<Props> = ({ d, sedi, onApri }) => {
  const oggi = d.dati?.oggi ?? new Date().toISOString().slice(0, 10);
  const vista = DEFINIZIONI[d.vista];
  const primoCaricamento = d.caricamento && !d.dati;
  const riassumi = d.vista === 'da-fare';
  const senzaData = riassumi ? (d.dati?.conteggi.daCompletare ?? 0) : 0;
  // il numero nel colore della fascia scelta, come nei riquadri in alto (grigio se zero)
  const coloreConteggio = !d.totale ? 'text-text-disabled' : vista.fascia ? FASCE_ASPETTO[vista.fascia].numero : undefined;

  return (
    <Riquadro
      titolo={vista.etichetta}
      conteggio={primoCaricamento ? undefined : d.totale}
      coloreConteggio={coloreConteggio}
      azioni={
        d.vista !== 'da-fare' && (
          <Button variant='outline' size='sm' onClick={() => d.scegliVista(d.vista)}>
            Mostra tutto ciò che è da fare
          </Button>
        )
      }
    >
      <FiltriDaFare
        filtri={d.filtri}
        onFiltri={d.setFiltri}
        sedi={sedi}
        ordina={d.ordina}
        onOrdina={d.setOrdina}
        filtriAttivi={d.filtriAttivi}
        onAzzera={d.azzeraFiltri}
        azioni={
          <ExportPdfAction
            onClick={() => void d.esportaPdf(sedi)}
            disabled={primoCaricamento || (d.totale === 0 && senzaData === 0)}
            isLoading={d.esporto}
            loadingText='Preparo il PDF…'
          />
        }
      />

      {primoCaricamento && (
        <div className={GRIGLIA}>
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className='h-32 rounded-lg' />
          ))}
        </div>
      )}

      {!primoCaricamento && d.righe.length === 0 && senzaData === 0 && (
        <p className='rounded-lg border border-dashed border-border-default p-8 text-center text-text-secondary'>
          {d.filtriAttivi ? 'Nessuna scadenza con questi filtri.' : vista.vuoto}
        </p>
      )}

      {(d.righe.length > 0 || senzaData > 0) && (
        <div className={GRIGLIA}>
          {d.righe.map(s => (
            <SchedaScadenza key={s.uuid} s={s} fascia={fasciaDi(s, oggi)} onApri={() => onApri(s.uuid)} />
          ))}
          {senzaData > 0 && (
            <button
              type='button'
              onClick={() => d.scegliVista('da-completare')}
              className={`flex h-32 flex-col justify-between rounded-lg border border-transparent p-4 text-left shadow-sm transition-all duration-200 motion-safe:hover:-translate-y-0.5 hover:border-white/70 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary ${FASCE_ASPETTO['da-completare'].card}`}
            >
              <span>
                <span className='block text-3xl font-bold leading-none'>{senzaData}</span>
                <span className='mt-1 block text-sm font-semibold'>
                  {senzaData === 1 ? 'scadenza senza data' : 'scadenze senza data'}
                </span>
              </span>
              <span className='self-end rounded-full bg-black/15 px-2 py-1 text-xs font-semibold'>Mostra</span>
            </button>
          )}
        </div>
      )}

      {d.altre && (
        <div className='mt-5 flex justify-center'>
          <Button variant='secondary' onClick={d.mostraAltre} isLoading={d.caricamento} loadingText='Carico…'>
            Mostra altre ({d.totale - d.righe.length})
          </Button>
        </div>
      )}
    </Riquadro>
  );
};
