// src/features/vigilo/components/avvisi/SceltaArgomenti.tsx
//
// Di che cosa avvisarmi (04-avvisi 4.4): tutto, oppure solo alcuni tipi di
// soggetto e alcune sedi ("chi segue il magazzino non riceve le patenti").
// I filtri valgono per gli avvisi che arrivano all'ufficio: ciò che ti
// riguarda direttamente arriva sempre, come i promemoria senza soggetto e i
// soggetti senza sede. Chi non è dell'ufficio (l'addetto) riceve solo ciò
// che lo riguarda: per lui la sezione lo dice e basta.
import React from 'react';
import { Checkbox, MultiSelect, RadioGroup } from '@edg/ui';

import { TIPI } from '../../constants/tipiSoggetto';
import type { SedeAvvisi } from '../../types/avvisi';
import { TIPI_SOGGETTO, type TipoSoggetto } from '../../types/valori';
import type { BozzaPreferenze } from '../../utils/preferenzeAvvisi';
import { SezionePreferenze } from './SezionePreferenze';

const SEMPRE = 'Ciò che ti riguarda direttamente arriva sempre: le tue scadenze, i mezzi assegnati a te, i soggetti di cui sei referente.';

export const SceltaArgomenti: React.FC<{
  bozza: BozzaPreferenze;
  comeUfficio: boolean;
  sedi: SedeAvvisi[];
  limiteSedi: number;
  problema: string | null;
  onCambia: (p: Partial<BozzaPreferenze>) => void;
}> = ({ bozza, comeUfficio, sedi, limiteSedi, problema, onCambia }) => {
  if (!comeUfficio)
    return (
      <SezionePreferenze titolo='Di che cosa'>
        <p className='text-sm text-text-secondary'>
          Ricevi gli avvisi di ciò che ti riguarda: le tue scadenze, i mezzi assegnati a te, i soggetti di cui sei referente.
        </p>
      </SezionePreferenze>
    );

  const commuta = (t: TipoSoggetto, dentro: boolean) =>
    onCambia({ tipi: dentro ? TIPI_SOGGETTO.filter(x => x === t || bozza.tipi.includes(x)) : bozza.tipi.filter(x => x !== t) });

  return (
    <SezionePreferenze titolo='Di che cosa' descrizione={SEMPRE}>
      <RadioGroup
        value={bozza.modo}
        onValueChange={v => onCambia({ modo: v as BozzaPreferenze['modo'] })}
        options={[
          { value: 'tutto', label: 'Tutto', description: "Gli avvisi di tutti i soggetti seguiti dall'ufficio." },
          { value: 'alcuni', label: 'Solo alcuni', description: 'Scegli i tipi di soggetto e, se vuoi, le sedi.' },
        ]}
      />

      {bozza.modo === 'alcuni' && (
        <div className='space-y-4 border-t border-border-thin pt-4'>
          <fieldset>
            <legend className='mb-2 text-sm font-medium text-text-primary'>Tipi di soggetto</legend>
            <div className='grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3'>
              {TIPI_SOGGETTO.map(t => (
                <Checkbox key={t} label={TIPI[t].plurale} checked={bozza.tipi.includes(t)} onCheckedChange={v => commuta(t, v === true)} />
              ))}
            </div>
          </fieldset>

          {sedi.length > 0 && (
            <MultiSelect
              label='Sedi'
              placeholder='Tutte le sedi'
              options={sedi.map(s => ({ value: s.uuid, label: s.archiviata ? `${s.nome} (archiviata)` : s.nome }))}
              value={bozza.sedi}
              onChange={v => onCambia({ sedi: v })}
              helperText={`Nessuna scelta = tutte. Al massimo ${limiteSedi}. I soggetti senza sede arrivano comunque.`}
            />
          )}

          {problema ? (
            <p className='text-sm font-medium text-text-danger'>{problema}</p>
          ) : (
            bozza.tipi.length === TIPI_SOGGETTO.length &&
            !bozza.sedi.length && <p className='text-sm text-text-secondary'>Togli la spunta ai tipi che non ti interessano{sedi.length ? ', o scegli le sedi' : ''}.</p>
          )}
        </div>
      )}
    </SezionePreferenze>
  );
};
