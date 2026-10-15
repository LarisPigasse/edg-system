// src/features/vigilo/components/soggetto/ModificaSoggetto.tsx
//
// La modifica di un soggetto nel pannello laterale (largo), con lo stesso
// modulo del nuovo più la categoria. Il tipo non cambia. Se la categoria
// cambia, lo dice prima: arrivano le scadenze dei nuovi controlli automatici,
// quelle che aveva restano.
import React, { useEffect, useState } from 'react';
import { Alert, Button, Sheet } from '@edg/ui';

import { useRiferimenti } from '../../hooks/useRiferimenti';
import type { DatiSoggetto, Soggetto } from '../../types/soggetti';
import { campiDi, corpoSoggetto, mancanti, valoriIniziali } from '../../utils/formSoggetto';
import { FormSoggetto } from './FormSoggetto';

interface Props {
  s: Soggetto;
  aperto: boolean;
  inCorso: boolean;
  onChiudi: () => void;
  onSalva: (dati: Omit<DatiSoggetto, 'tipo'>) => Promise<boolean>;
}

export const ModificaSoggetto: React.FC<Props> = ({ s, aperto, inCorso, onChiudi, onSalva }) => {
  const r = useRiferimenti();
  const [valori, setValori] = useState(() => valoriIniziali(s));

  // a ogni apertura si riparte dai dati attuali
  useEffect(() => {
    if (aperto) setValori(valoriIniziali(s));
  }, [aperto, s]);

  const campi = campiDi(r.tutteLeCategorie, valori.categoria);
  const daCompilare = mancanti(valori, campi);
  const nuovaCategoria = (valori.categoria ?? null) !== (s.categoria?.uuid ?? null);

  const salva = async () => {
    if (await onSalva(corpoSoggetto(valori, s.tipo, campi))) onChiudi();
  };

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title={`Modifica ${s.nome}`}
      description={daCompilare.length ? `Manca: ${daCompilare.join(', ')}` : undefined}
      className='w-full! sm:max-w-3xl!'
      footer={
        <>
          <Button variant='secondary' onClick={onChiudi} disabled={inCorso}>
            Annulla
          </Button>
          <Button onClick={() => void salva()} disabled={daCompilare.length > 0 || !r.pronti} isLoading={inCorso} loadingText='Salvo…'>
            Salva
          </Button>
        </>
      }
    >
      <div className='space-y-6'>
        {nuovaCategoria && (
          <Alert variant='info' title='Cambi categoria'>
            Vigilo aggiunge le scadenze dei controlli automatici della nuova categoria; quelle che il soggetto ha già restano.
          </Alert>
        )}
        <FormSoggetto tipo={s.tipo} valori={valori} onValori={setValori} riferimenti={r} conCategoria escludi={s.uuid} />
      </div>
    </Sheet>
  );
};
