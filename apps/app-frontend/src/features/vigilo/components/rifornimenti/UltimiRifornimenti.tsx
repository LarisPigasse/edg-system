// src/features/vigilo/components/rifornimenti/UltimiRifornimenti.tsx
//
// In "I miei mezzi" dell'addetto (tappa 2): gli ultimi 4 rifornimenti del
// mezzo, per vedere subito che cosa è già stato scritto. Su quelli suoi
// "Correggi" ed "Elimina" (con conferma). L'importo lo vede solo sui suoi.
import React, { useState } from 'react';
import { Button, ConfirmModal, Pencil, Trash2 } from '@edg/ui';

import { ULTIMI_RIFORNIMENTI } from '../../constants/rifornimenti';
import { useRifornimenti } from '../../hooks/useRifornimenti';
import type { Rifornimento } from '../../types/rifornimenti';
import { giornoBreve } from '../../utils/giorni';
import { euroEsatti, letturaTesto, litriTesto } from '../../utils/rifornimenti';
import { Riquadro } from '../Riquadro';

interface Props {
  soggetto: string;
  versione: number;
  onCorreggi: (r: Rifornimento) => void;
  onElimina: (r: Rifornimento) => Promise<boolean>;
}

const dettagli = (r: Rifornimento) =>
  [r.litri != null ? litriTesto(r.litri) : null, r.importo != null ? euroEsatti(r.importo) : null, r.lettura ? letturaTesto(r.lettura) : null].filter(Boolean).join(' · ');

const Icona: React.FC<{ etichetta: string; onClick: () => void; children: React.ReactNode }> = ({ etichetta, onClick, children }) => (
  <button
    type='button'
    onClick={onClick}
    aria-label={etichetta}
    title={etichetta}
    className='rounded-md p-1.5 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary'
  >
    {children}
  </button>
);

export const UltimiRifornimenti: React.FC<Props> = ({ soggetto, versione, onCorreggi, onElimina }) => {
  const x = useRifornimenti(soggetto, ULTIMI_RIFORNIMENTI, versione);
  const [daEliminare, setDaEliminare] = useState<Rifornimento | null>(null);
  const [eliminando, setEliminando] = useState(false);

  return (
    <Riquadro titolo='Ultimi rifornimenti' accanto={x.totale > ULTIMI_RIFORNIMENTI ? `${ULTIMI_RIFORNIMENTI} di ${x.totale}` : undefined}>
      {x.errore ? (
        <p className='text-sm text-text-error'>{x.errore}</p>
      ) : !x.righe.length ? (
        <p className='text-sm text-text-secondary'>{x.caricamento ? 'Carico…' : 'Nessun rifornimento finora.'}</p>
      ) : (
        <ul className='divide-y divide-border-thin'>
          {x.righe.map(r => (
            <li key={r.uuid} className='flex items-center gap-3 py-2 text-sm'>
              <span className='w-24 shrink-0 tabular-nums text-text-secondary'>{giornoBreve(r.fattoIl)}</span>
              <span className='min-w-0 flex-1'>
                <span className='font-medium text-text-primary'>{r.nomeVoce}</span>
                {dettagli(r) && <span className='block truncate text-xs text-text-secondary sm:ml-2 sm:inline'>{dettagli(r)}</span>}
              </span>
              {r.modificabile && (
                <span className='flex shrink-0'>
                  <Icona etichetta='Correggi' onClick={() => onCorreggi(r)}>
                    <Pencil className='h-4 w-4' />
                  </Icona>
                  <Icona etichetta='Elimina' onClick={() => setDaEliminare(r)}>
                    <Trash2 className='h-4 w-4' />
                  </Icona>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {x.errore && (
        <Button size='sm' variant='secondary' className='mt-3' onClick={() => void x.ricarica()}>
          Riprova
        </Button>
      )}
      <ConfirmModal
        isOpen={!!daEliminare}
        onClose={() => setDaEliminare(null)}
        onConfirm={async () => {
          if (!daEliminare) return;
          setEliminando(true);
          const ok = await onElimina(daEliminare);
          setEliminando(false);
          if (ok) {
            setDaEliminare(null);
            void x.ricarica();
          }
        }}
        title='Eliminare il rifornimento?'
        message={
          daEliminare
            ? `${daEliminare.nomeVoce} del ${giornoBreve(daEliminare.fattoIl)}: si eliminano anche ${daEliminare.lettura ? 'la lettura del contatore e ' : ''}gli scontrini allegati.`
            : ''
        }
        confirmText='Elimina'
        cancelText='Annulla'
        variant='danger'
        isLoading={eliminando}
        loadingText='Elimino…'
      />
    </Riquadro>
  );
};
