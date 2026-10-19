// src/features/vigilo/components/soggetto/CampoDato.tsx
//
// Un campo del modulo di un soggetto, del tipo giusto: testo, email, numero,
// data (selettore), elenco (select) o sì/no (interruttore). Serve per i dati
// del tipo e per i campi aggiuntivi della categoria.
import React from 'react';
import { DatePicker, Input, Select, Switch } from '@edg/ui';

import { aGiorno, daGiorno } from '../../utils/giorni';
import type { ValoreCampo } from '../../utils/formSoggetto';
import { etichettaOpzione } from '../../utils/testo';

const NESSUNO = '__nessuno';

interface Props {
  etichetta: string;
  formato: 'testo' | 'email' | 'numero' | 'data' | 'elenco' | 'si-no';
  opzioni?: string[];
  obbligatorio?: boolean;
  valore: ValoreCampo | undefined;
  onCambia: (v: ValoreCampo) => void;
}

export const CampoDato: React.FC<Props> = ({ etichetta, formato, opzioni = [], obbligatorio, valore, onCambia }) => {
  const testo = typeof valore === 'string' ? valore : '';
  switch (formato) {
    case 'data':
      return (
        <DatePicker label={etichetta} required={obbligatorio} value={testo ? daGiorno(testo) : undefined} onChange={d => onCambia(d ? aGiorno(d) : '')} />
      );
    case 'elenco':
      return (
        <Select
          label={etichetta}
          value={testo || NESSUNO}
          onValueChange={v => onCambia(v === NESSUNO ? '' : v)}
          options={[{ value: NESSUNO, label: obbligatorio ? 'Scegli…' : '—' }, ...opzioni.map(o => ({ value: o, label: etichettaOpzione(o) }))]}
        />
      );
    case 'si-no':
      return (
        <div className='flex min-h-[56px] items-end pb-2'>
          <Switch label={etichetta} checked={valore === true} onCheckedChange={v => onCambia(v)} />
        </div>
      );
    default:
      return (
        <Input
          label={etichetta}
          required={obbligatorio}
          type={formato === 'email' ? 'email' : 'text'}
          inputMode={formato === 'numero' ? 'decimal' : undefined}
          value={testo}
          onChange={e => onCambia(e.target.value)}
        />
      );
  }
};
