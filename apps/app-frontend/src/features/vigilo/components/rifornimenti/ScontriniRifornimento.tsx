// src/features/vigilo/components/rifornimenti/ScontriniRifornimento.tsx
//
// Lo scontrino nel modulo del rifornimento: "Allega" (e "Scatta una foto" sui
// dispositivi touch). I file scelti restano qui finché non si salva; quelli
// già allegati (in correzione) si aprono con un clic e si tolgono con una
// conferma sulla riga stessa, senza finestre sopra il pannello.
import React, { useState } from 'react';
import { Button, FileText, ImageIcon, X } from '@edg/ui';

import type { InCaricamento, VoceAllegato } from '../../types/allegati';
import { dimensioneLeggibile, eImmagine } from '../../utils/allegati';
import { InArrivo, PulsantiCarica } from '../documenti/CaricaDocumenti';

interface Props {
  /** Già allegati (solo in correzione) */
  esistenti: VoceAllegato[];
  /** Scelti ora, partono al salvataggio */
  scelti: File[];
  inArrivo: InCaricamento[];
  disabilitato: boolean;
  onScegli: (files: File[]) => void;
  onTogli: (indice: number) => void;
  onApri: (a: VoceAllegato) => void;
  /** Elimina subito un documento già allegato; assente = non si può */
  onElimina?: (a: VoceAllegato) => Promise<boolean>;
  /** Chi guarda può togliere quel documento (l'addetto solo i suoi) */
  eliminabile?: (a: VoceAllegato) => boolean;
}

const Riga: React.FC<{ nome: string; tipo: string; dimensione: number; children?: React.ReactNode; onApri?: () => void }> = ({ nome, tipo, dimensione, children, onApri }) => {
  const Icona = eImmagine(tipo) ? ImageIcon : FileText;
  return (
    <li className='flex items-center gap-3 px-3 py-2 text-sm'>
      <Icona className='h-4 w-4 shrink-0 text-text-secondary' aria-hidden />
      {onApri ? (
        <button type='button' onClick={onApri} className='min-w-0 flex-1 truncate text-left text-text-link hover:underline'>
          {nome}
        </button>
      ) : (
        <span className='min-w-0 flex-1 truncate text-text-primary'>{nome}</span>
      )}
      <span className='shrink-0 text-xs text-text-secondary'>{dimensioneLeggibile(dimensione)}</span>
      {children}
    </li>
  );
};

const Togli: React.FC<{ nome: string; onClick: () => void; disabled?: boolean }> = ({ nome, onClick, disabled }) => (
  <button
    type='button'
    onClick={onClick}
    disabled={disabled}
    aria-label={`Togli ${nome}`}
    title='Togli'
    className='rounded-md p-1 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-50'
  >
    <X className='h-4 w-4' />
  </button>
);

export const ScontriniRifornimento: React.FC<Props> = ({ esistenti, scelti, inArrivo, disabilitato, onScegli, onTogli, onApri, onElimina, eliminabile = () => true }) => {
  const [daEliminare, setDaEliminare] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const elimina = async (a: VoceAllegato) => {
    if (!onElimina) return;
    setEliminando(true);
    if (await onElimina(a)) setDaEliminare(null);
    setEliminando(false);
  };

  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <p className='text-sm font-medium text-text-primary'>
          Scontrino o fattura <span className='font-normal text-text-secondary'>(facoltativo)</span>
        </p>
        <PulsantiCarica onFile={onScegli} disabilitato={disabilitato} etichetta='Allega' />
      </div>
      <InArrivo voci={inArrivo} />
      {(esistenti.length > 0 || scelti.length > 0) && (
        <ul className='divide-y divide-border-thin rounded-lg border border-border-default'>
          {esistenti.map(a =>
            daEliminare === a.uuid ? (
              <li key={a.uuid} className='flex flex-wrap items-center gap-2 bg-bg-secondary px-3 py-2 text-sm'>
                <span className='min-w-0 flex-1 truncate text-text-primary'>Eliminare «{a.nome}»?</span>
                <Button type='button' size='sm' variant='secondary' onClick={() => setDaEliminare(null)} disabled={eliminando}>
                  No
                </Button>
                <Button type='button' size='sm' variant='danger' onClick={() => void elimina(a)} isLoading={eliminando} loadingText='Elimino…'>
                  Elimina
                </Button>
              </li>
            ) : (
              <Riga key={a.uuid} nome={a.nome} tipo={a.tipo} dimensione={a.dimensione} onApri={() => onApri(a)}>
                {onElimina && eliminabile(a) && <Togli nome={a.nome} onClick={() => setDaEliminare(a.uuid)} disabled={disabilitato} />}
              </Riga>
            )
          )}
          {scelti.map((f, i) => (
            <Riga key={`${f.name}-${i}`} nome={f.name} tipo={f.type} dimensione={f.size}>
              <span className='shrink-0 text-xs text-text-secondary'>da caricare</span>
              <Togli nome={f.name} onClick={() => onTogli(i)} disabled={disabilitato} />
            </Riga>
          ))}
        </ul>
      )}
    </div>
  );
};
