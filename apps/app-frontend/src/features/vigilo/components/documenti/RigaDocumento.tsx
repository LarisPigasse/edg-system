// src/features/vigilo/components/documenti/RigaDocumento.tsx
//
// Un documento: icona del tipo, nome (clic = apre, o scarica se il browser non
// lo mostra), descrizione, quando · chi · quanto; a destra Scarica ed Elimina.
import React from 'react';
import { Download, FileText, ImageIcon, Tooltip, Trash2 } from '@edg/ui';

import type { VoceAllegato } from '../../types/allegati';
import { dettaglioAllegato, eImmagine } from '../../utils/allegati';

interface Props {
  a: VoceAllegato;
  onApri: () => void;
  onScarica: () => void;
  /** Assente = non si può eliminare */
  onElimina?: () => void;
  occupato?: boolean;
}

const Azione: React.FC<{ etichetta: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }> = ({ etichetta, onClick, disabled, children }) => (
  <Tooltip content={etichetta}>
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={etichetta}
      className='rounded-md p-1.5 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary disabled:opacity-50'
    >
      {children}
    </button>
  </Tooltip>
);

export const RigaDocumento: React.FC<Props> = ({ a, onApri, onScarica, onElimina, occupato }) => {
  const Icona = eImmagine(a.tipo) ? ImageIcon : FileText;
  return (
    <li className='flex items-start gap-3 px-3 py-2.5'>
      <Icona className='mt-0.5 h-5 w-5 shrink-0 text-text-secondary' aria-hidden />
      <div className='min-w-0 flex-1'>
        <button
          type='button'
          onClick={onApri}
          className='block max-w-full truncate text-left text-sm font-medium text-text-primary hover:text-action-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary'
          title={a.apribile ? `Apri ${a.nome}` : `Scarica ${a.nome}`}
        >
          {a.nome}
        </button>
        {a.descrizione && <p className='truncate text-sm text-text-secondary'>{a.descrizione}</p>}
        <p className='text-xs text-text-secondary'>{dettaglioAllegato(a)}</p>
      </div>
      <div className='flex shrink-0 items-center gap-0.5'>
        <Azione etichetta='Scarica' onClick={onScarica}>
          <Download className='h-4 w-4' />
        </Azione>
        {onElimina && (
          <Azione etichetta='Elimina' onClick={onElimina} disabled={occupato}>
            <Trash2 className='h-4 w-4' />
          </Azione>
        )}
      </div>
    </li>
  );
};
