// src/features/vigilo/components/PreavvisiEditor.tsx
//
// Editor dei preavvisi in giorni (passo 7.8): etichette "32 · 8 · 1" con la
// x per toglierle e un campo per aggiungerne. Sempre in ordine dal più
// lontano al più vicino, senza ripetizioni (come chiede il servizio).
import React, { useState } from 'react';
import { Button, X, cn } from '@edg/ui';

const MASSIMO = 1024;
const MASSIMO_PREAVVISI = 8;

interface Props {
  giorni: number[];
  onChange: (giorni: number[]) => void;
  disabled?: boolean;
}

const ordinaPreavvisi = (giorni: number[]) => [...new Set(giorni)].sort((a, b) => b - a);

export const PreavvisiEditor: React.FC<Props> = ({ giorni, onChange, disabled }) => {
  const [nuovo, setNuovo] = useState('');
  const valore = Number(nuovo);
  const valido = Number.isInteger(valore) && valore >= 1 && valore <= MASSIMO && !giorni.includes(valore);
  const pieno = giorni.length >= MASSIMO_PREAVVISI;

  const aggiungi = () => {
    if (!valido || pieno) return;
    onChange(ordinaPreavvisi([...giorni, valore]));
    setNuovo('');
  };

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {giorni.length === 0 && <span className='text-sm text-text-secondary'>Nessun preavviso: solo il giorno della scadenza</span>}
      {giorni.map(g => (
        <span
          key={g}
          className='inline-flex items-center gap-1 rounded-full border border-border-default bg-bg-secondary py-1 pl-3 pr-1 text-sm font-medium text-text-primary'
        >
          {g} {g === 1 ? 'giorno' : 'giorni'}
          <button
            type='button'
            disabled={disabled}
            onClick={() => onChange(giorni.filter(x => x !== g))}
            className='rounded-full p-0.5 text-text-secondary hover:bg-bg-hover hover:text-text-primary disabled:opacity-50'
            aria-label={`Togli il preavviso a ${g} giorni`}
          >
            <X className='h-3.5 w-3.5' />
          </button>
        </span>
      ))}
      {!pieno && (
        <span className='inline-flex items-center gap-1'>
          <input
            type='number'
            min={1}
            max={MASSIMO}
            inputMode='numeric'
            value={nuovo}
            disabled={disabled}
            onChange={e => setNuovo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), aggiungi())}
            aria-label='Nuovo preavviso in giorni'
            placeholder='giorni'
            className={cn(
              'w-20 rounded-md border border-border-default bg-bg-primary px-2 py-1 text-sm text-text-primary',
              nuovo && !valido && 'border-text-error'
            )}
          />
          <Button size='xs' variant='secondary' onClick={aggiungi} disabled={disabled || !valido}>
            Aggiungi
          </Button>
        </span>
      )}
    </div>
  );
};
