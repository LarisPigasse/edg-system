// src/features/vigilo/components/fornitori/PannelloFornitore.tsx
//
// Nuovo fornitore o modifica, nel pannello laterale (F1). Salva solo con
// nome e tipo (e un'email valida, se scritta): sotto il titolo "Manca: …" o
// che si può salvare (la riga resta, i campi non saltano). A ogni apertura
// riparte dai dati attuali.
import React, { useEffect, useState } from 'react';
import { Button, Sheet } from '@edg/ui';

import type { DatiFornitore, Fornitore, TipoFornitore } from '../../types/fornitori';
import { corpoFornitore, erroreEmail, mancanti, salvabile, valoriIniziali } from '../../utils/formFornitore';
import { CampiFornitore } from './CampiFornitore';

interface Props {
  /** null: fornitore nuovo */
  fornitore: Fornitore | null;
  aperto: boolean;
  inCorso: boolean;
  tipi: TipoFornitore[];
  onChiudi: () => void;
  onSalva: (dati: DatiFornitore) => Promise<boolean>;
}

export const PannelloFornitore: React.FC<Props> = ({ fornitore, aperto, inCorso, tipi, onChiudi, onSalva }) => {
  const [valori, setValori] = useState(() => valoriIniziali(fornitore));

  useEffect(() => {
    if (aperto) setValori(valoriIniziali(fornitore));
  }, [aperto, fornitore]);

  const manca = mancanti(valori);
  const stato = manca.length ? `Manca: ${manca.join(', ')}` : erroreEmail(valori.email) ? "Controlla l'email" : 'Nome e tipo ci sono: puoi salvare';
  const salva = async () => {
    if (await onSalva(corpoFornitore(valori))) onChiudi();
  };

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title={fornitore ? `Modifica ${fornitore.nome}` : 'Nuovo fornitore'}
      description={stato}
      className='w-full! sm:max-w-2xl!'
      footer={
        <>
          <Button variant='secondary' onClick={onChiudi} disabled={inCorso}>
            Annulla
          </Button>
          <Button onClick={() => void salva()} disabled={!salvabile(valori)} isLoading={inCorso} loadingText='Salvo…'>
            {fornitore ? 'Salva' : 'Aggiungi'}
          </Button>
        </>
      }
    >
      <CampiFornitore valori={valori} onValori={setValori} tipi={tipi} tipoAttuale={fornitore?.tipo} />
    </Sheet>
  );
};
