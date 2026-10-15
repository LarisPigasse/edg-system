// src/features/vigilo/components/nuovo-soggetto/PassoScadenze.tsx
//
// Ultimo passo: le scadenze appena create dai controlli automatici, con la
// data (e la soglia, per quelle a contatore) da inserire se la si conosce.
// Quelle che Vigilo ha già calcolato dai dati (es. dall'immatricolazione)
// arrivano compilate; quelle lasciate vuote restano "da completare".
import React from 'react';
import { DatePicker, Input } from '@edg/ui';

import { NATURE_TESTO } from '../../constants/nature';
import type { Completamento } from '../../hooks/useNuovoSoggetto';
import type { Scadenza } from '../../types/scadenze';
import { aGiorno, daGiorno } from '../../utils/giorni';
import { intero } from '../../utils/numeri';
import { StatoScadenza } from '../StatoScadenza';
import { Riquadro } from '../Riquadro';

interface Props {
  scadenze: Scadenza[];
  completamenti: Record<string, Completamento>;
  onCompleta: (uuid: string, c: Partial<Completamento>) => void;
}

export const PassoScadenze: React.FC<Props> = ({ scadenze, completamenti, onCompleta }) => (
  <Riquadro titolo='Le date delle scadenze' accanto={scadenze.length ? `${scadenze.length}` : undefined}>
    {scadenze.length === 0 ? (
      <p className='text-sm text-text-secondary'>
        Nessuna scadenza creata: la categoria non ha controlli automatici. Potrai aggiungere scadenze dalla scheda.
      </p>
    ) : (
      <>
        <p className='-mt-2 mb-4 text-sm text-text-secondary'>
          Inserisci le date che conosci (es. la prossima revisione): quelle lasciate vuote restano da completare e le ritrovi in dashboard.
        </p>
        <ul className='divide-y divide-border-default'>
          {scadenze.map(s => {
            const c = completamenti[s.uuid] ?? { scadeIl: '', soglia: '' };
            const soglia = intero(c.soglia);
            return (
              <li key={s.uuid} className='grid items-end gap-x-6 gap-y-2 py-3 md:grid-cols-[minmax(0,1fr)_14rem_12rem]'>
                <div className='min-w-0 self-center'>
                  <p className='font-medium text-text-primary'>{s.titolo}</p>
                  <p className='text-sm text-text-secondary'>
                    {s.controllo ? NATURE_TESTO[s.controllo.natura] : 'Promemoria'} · <StatoScadenza stato={s.stato} testo={s.testo} className='font-semibold' />
                  </p>
                </div>
                <DatePicker label='Scade il' value={c.scadeIl ? daGiorno(c.scadeIl) : undefined} onChange={d => onCompleta(s.uuid, { scadeIl: d ? aGiorno(d) : '' })} />
                {s.contatore ? (
                  <Input
                    label={`Oppure a (${s.contatore.unita})`}
                    inputMode='numeric'
                    value={c.soglia}
                    onChange={e => onCompleta(s.uuid, { soglia: e.target.value })}
                    error={Number.isNaN(soglia) ? 'Un numero intero' : undefined}
                  />
                ) : (
                  <span aria-hidden />
                )}
              </li>
            );
          })}
        </ul>
      </>
    )}
  </Riquadro>
);
