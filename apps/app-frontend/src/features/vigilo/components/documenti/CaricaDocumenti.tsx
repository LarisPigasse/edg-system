// src/features/vigilo/components/documenti/CaricaDocumenti.tsx
//
// Come arrivano i documenti (B9a): il pulsante Carica (più file), "Scatta una
// foto" sui dispositivi touch (apre la fotocamera) e, sotto, le barre dei file
// in caricamento. Il trascinamento lo gestisce chi contiene (Documenti),
// perché la zona è tutta la sezione.
import React, { useRef } from 'react';
import { Button, Camera, Upload } from '@edg/ui';

import { TIPI_ACCETTATI } from '../../constants/allegati';
import type { InCaricamento } from '../../types/allegati';

const touch = (): boolean => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

interface Props {
  onFile: (files: File[]) => void;
  inArrivo: InCaricamento[];
  disabilitato?: boolean;
  /** Etichetta del pulsante principale */
  etichetta?: string;
}

export const PulsantiCarica: React.FC<Omit<Props, 'inArrivo'>> = ({ onFile, disabilitato, etichetta = 'Carica' }) => {
  const file = useRef<HTMLInputElement>(null);
  const foto = useRef<HTMLInputElement>(null);
  const scelti = (e: React.ChangeEvent<HTMLInputElement>) => {
    const l = [...(e.target.files ?? [])];
    e.target.value = ''; // lo stesso file si può riscegliere
    if (l.length) onFile(l);
  };
  return (
    <div className='flex flex-wrap gap-2'>
      <input ref={file} type='file' accept={TIPI_ACCETTATI} multiple hidden onChange={scelti} />
      <input ref={foto} type='file' accept='image/*' capture='environment' hidden onChange={scelti} />
      <Button type='button' size='sm' variant='secondary' leftIcon={<Upload className='h-4 w-4' />} onClick={() => file.current?.click()} disabled={disabilitato}>
        {etichetta}
      </Button>
      {touch() && (
        <Button type='button' size='sm' variant='secondary' leftIcon={<Camera className='h-4 w-4' />} onClick={() => foto.current?.click()} disabled={disabilitato}>
          Scatta una foto
        </Button>
      )}
    </div>
  );
};

/** Le barre dei file in caricamento */
export const InArrivo: React.FC<{ voci: InCaricamento[] }> = ({ voci }) =>
  voci.length ? (
    <ul className='space-y-2' aria-live='polite'>
      {voci.map(c => (
        <li key={c.id} className='text-sm'>
          <div className='mb-1 flex justify-between gap-3 text-text-secondary'>
            <span className='min-w-0 truncate'>{c.nome}</span>
            <span className='tabular-nums'>{Math.round(c.avanzamento * 100)}%</span>
          </div>
          <div className='h-1.5 overflow-hidden rounded-full bg-bg-secondary' role='progressbar' aria-valuenow={Math.round(c.avanzamento * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className='h-full bg-action-primary transition-[width]' style={{ width: `${Math.max(4, c.avanzamento * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  ) : null;
