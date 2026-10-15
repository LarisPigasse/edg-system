// src/features/vigilo/components/soggetto/DatiSoggetto.tsx
//
// I dati del soggetto: quelli fissi del tipo, i campi aggiuntivi della sua
// categoria e il resto (codice interno, note, date di inserimento). Si
// mostrano anche i vuoti, per vedere che cosa manca.
import React from 'react';

import { DATI_TIPO } from '../../constants/datiTipo';
import { TIPI } from '../../constants/tipiSoggetto';
import type { CampoAggiuntivo } from '../../types/configurazione';
import type { Soggetto } from '../../types/soggetti';
import { testoDato } from '../../utils/dati';
import { giornoEsteso } from '../../utils/giorni';
import { Riquadro } from '../Riquadro';

const Elenco: React.FC<{ righe: [string, string | null][] }> = ({ righe }) => (
  <dl className='grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-6 gap-y-2 text-sm'>
    {righe.map(([etichetta, valore]) => (
      <React.Fragment key={etichetta}>
        <dt className='text-text-secondary'>{etichetta}</dt>
        <dd className={valore ? 'text-text-primary' : 'text-text-disabled'}>{valore ?? '—'}</dd>
      </React.Fragment>
    ))}
  </dl>
);

export const DatiSoggetto: React.FC<{ s: Soggetto; campi: CampoAggiuntivo[] }> = ({ s, campi }) => {
  const delTipo: [string, string | null][] = [
    [s.etichettaIdentificativo, s.identificativo],
    ...DATI_TIPO[s.tipo].map(d => [d.etichetta, testoDato(s.dati[d.chiave], d.formato)] as [string, string | null]),
  ];
  const altro: [string, string | null][] = [
    ['Codice interno', s.codice],
    ['Note', s.note],
    ['Inserito il', giornoEsteso(s.creatoIl.slice(0, 10))],
    ['Ultima modifica', giornoEsteso(s.modificatoIl.slice(0, 10))],
  ];
  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      <Riquadro titolo={`Dati ${TIPI[s.tipo].femminile ? 'della' : 'del'} ${TIPI[s.tipo].singolare}`}>
        <Elenco righe={delTipo} />
      </Riquadro>
      <div className='space-y-4'>
        {campi.length > 0 && (
          <Riquadro titolo={`Campi della categoria ${s.categoria?.nome ?? ''}`}>
            <Elenco righe={campi.map(c => [c.etichetta, testoDato(s.campi[c.chiave], c.tipo)])} />
          </Riquadro>
        )}
        <Riquadro titolo='Altro'>
          <Elenco righe={altro} />
        </Riquadro>
      </div>
    </div>
  );
};
