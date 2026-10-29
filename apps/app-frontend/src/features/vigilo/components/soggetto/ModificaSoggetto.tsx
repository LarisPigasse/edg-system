// src/features/vigilo/components/soggetto/ModificaSoggetto.tsx
//
// La modifica di un soggetto nel pannello laterale (largo), con lo stesso
// modulo del nuovo più la categoria. Il tipo non cambia. Se la categoria
// cambia, lo dice prima: arrivano le scadenze dei nuovi controlli automatici,
// quelle che aveva restano. Per una persona, a chi ha vigilo.costi, anche il
// costo orario della manodopera (passo 8).
import React, { useEffect, useState } from 'react';
import { Alert, Button, Input, Sheet } from '@edg/ui';

import { useRiferimenti } from '../../hooks/useRiferimenti';
import type { DatiSoggetto, Soggetto } from '../../types/soggetti';
import { campiDi, corpoSoggetto, mancanti, valoriIniziali } from '../../utils/formSoggetto';
import { importo as leggiImporto } from '../../utils/numeri';
import { FormSoggetto } from './FormSoggetto';

interface Props {
  s: Soggetto;
  aperto: boolean;
  inCorso: boolean;
  onChiudi: () => void;
  onSalva: (dati: Omit<DatiSoggetto, 'tipo'>) => Promise<boolean>;
}

/** Il costo orario come testo nel campo ('' se non indicato) */
const testoCosto = (n: number | null | undefined) => (n == null ? '' : n.toLocaleString('it-IT'));

export const ModificaSoggetto: React.FC<Props> = ({ s, aperto, inCorso, onChiudi, onSalva }) => {
  const r = useRiferimenti();
  const [valori, setValori] = useState(() => valoriIniziali(s));
  // costo orario: solo persone e solo a chi ha vigilo.costi (il servizio lo manda solo allora, passo 8)
  const conCosto = s.tipo === 'persona' && s.costoOrario !== undefined;
  const [costo, setCosto] = useState(testoCosto(s.costoOrario));
  const valoreCosto = leggiImporto(costo);
  const costoValido = !conCosto || !Number.isNaN(valoreCosto);

  // a ogni apertura si riparte dai dati attuali
  useEffect(() => {
    if (!aperto) return;
    setValori(valoriIniziali(s));
    setCosto(testoCosto(s.costoOrario));
  }, [aperto, s]);

  const campi = campiDi(r.tutteLeCategorie, valori.categoria);
  const daCompilare = mancanti(valori, campi);
  const nuovaCategoria = (valori.categoria ?? null) !== (s.categoria?.uuid ?? null);

  const salva = async () => {
    const corpo = corpoSoggetto(valori, s.tipo, campi);
    if (await onSalva(conCosto && valoreCosto !== (s.costoOrario ?? null) ? { ...corpo, costoOrario: valoreCosto } : corpo)) onChiudi();
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
          <Button onClick={() => void salva()} disabled={daCompilare.length > 0 || !r.pronti || !costoValido} isLoading={inCorso} loadingText='Salvo…'>
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
        {conCosto && (
          <div className='max-w-xs'>
            <Input
              label='Costo orario (€/h)'
              inputMode='decimal'
              value={costo}
              onChange={e => setCosto(e.target.value)}
              error={Number.isNaN(valoreCosto) ? 'Un importo, es. 32,50' : undefined}
              helperText='Per la manodopera interna. Vuoto: vale il costo predefinito delle impostazioni.'
            />
          </div>
        )}
      </div>
    </Sheet>
  );
};
