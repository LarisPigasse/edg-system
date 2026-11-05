// src/features/vigilo/components/costoMezzi/CampoPossesso.tsx
//
// Il costo di possesso nel modulo del mezzo (costo dei mezzi, tappa 1): come
// lo hai (non indicato, acquistato, leasing, noleggio), i dati del modo
// scelto e, sotto, la quota mensile calcolata dal servizio, gli errori e
// l'avviso morbido se la quota è molto lontana da quella degli altri mezzi
// della categoria (non impedisce di salvare). Solo a chi ha vigilo.costi.
import React from 'react';
import { Alert, DatePicker, Input, RadioGroup, Select } from '@edg/ui';

import { ANNI_POSSESSO, MODI_POSSESSO } from '../../constants/costoMezzi';
import type { AnteprimaPossesso } from '../../types/costoMezzi';
import type { SceltaPossesso, ValoriPossesso } from '../../utils/formPossesso';
import { aGiorno, daGiorno } from '../../utils/giorni';
import { euroBrevi } from '../../utils/resoconti';

const SCELTE = [{ value: 'nessuno', label: 'Non indicato', description: 'Il costo del mezzo sarà parziale: solo obblighi, manutenzione e guasti.' }, ...MODI_POSSESSO];

interface Props {
  valori: ValoriPossesso;
  onValori: (v: ValoriPossesso) => void;
  anteprima: AnteprimaPossesso | null;
  inAttesa: boolean;
  /** Errore nel leggere l'anteprima, o campi che non sono numeri */
  errore: string | null;
}

export const CampoPossesso: React.FC<Props> = ({ valori, onValori, anteprima, inAttesa, errore }) => {
  const v = valori;
  const imposta = (cambi: Partial<ValoriPossesso>) => onValori({ ...v, ...cambi });
  const errori = anteprima?.errori ?? [];
  return (
    <section className='space-y-4 rounded-lg border border-border-default p-4'>
      <div>
        <h3 className='text-sm font-semibold text-text-primary'>Costo di possesso</h3>
        <p className='text-sm text-text-secondary'>Quanto costa avere il mezzo anche quando è fermo: serve alla stima del costo dei mezzi.</p>
      </div>
      <RadioGroup label='Come lo hai' options={SCELTE} value={v.modo} onValueChange={m => imposta({ modo: m as SceltaPossesso })} />

      {v.modo === 'acquisto' && (
        <div className='grid gap-4 sm:grid-cols-3'>
          <Input label="Prezzo d'acquisto (€)" inputMode='decimal' value={v.prezzo} onChange={e => imposta({ prezzo: e.target.value })} />
          <Select
            label='Anni di uso previsti'
            value={v.anni || undefined}
            placeholder='Scegli'
            onValueChange={a => a && imposta({ anni: a })}
            options={ANNI_POSSESSO.map(a => ({ value: String(a), label: a === 1 ? '1 anno' : `${a} anni` }))}
          />
          <Input
            label='Valore finale stimato (€)'
            inputMode='decimal'
            value={v.valoreFinale}
            onChange={e => imposta({ valoreFinale: e.target.value })}
            helperText='Quanto varrà alla fine: vuoto = 0'
          />
        </div>
      )}
      {(v.modo === 'leasing' || v.modo === 'noleggio') && (
        <div className='max-w-xs'>
          <Input label='Canone mensile (€)' inputMode='decimal' value={v.canone} onChange={e => imposta({ canone: e.target.value })} />
        </div>
      )}
      {v.modo !== 'nessuno' && (
        <>
          <div className='max-w-xs'>
            <DatePicker
              label='Da quando conta (facoltativo)'
              value={v.dal ? daGiorno(v.dal) : undefined}
              onChange={d => imposta({ dal: d ? aGiorno(d) : '' })}
            />
          </div>
          <div aria-live='polite' className='space-y-2'>
            {errore && <p className='text-sm text-text-error'>{errore}</p>}
            {!errore && errori.length > 0 && <p className='text-sm text-text-secondary'>{errori.join('. ')}</p>}
            {!errore && anteprima?.mensile != null && (
              <p className='text-sm text-text-primary'>
                Quota: <span className='font-semibold tabular-nums'>≈ {euroBrevi(anteprima.mensile)} al mese</span>
              </p>
            )}
            {inAttesa && !anteprima && <p className='text-sm text-text-secondary'>Calcolo la quota…</p>}
            {anteprima?.avviso && (
              <Alert variant='warning' title='Da controllare'>
                {anteprima.avviso}
              </Alert>
            )}
          </div>
        </>
      )}
    </section>
  );
};
