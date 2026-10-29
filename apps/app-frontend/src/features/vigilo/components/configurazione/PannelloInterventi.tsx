// src/features/vigilo/components/configurazione/PannelloInterventi.tsx
//
// Le regole degli interventi del tenant nel pannello laterale (passo 8):
// giorni proposti per riparare un guasto che non blocca l'uso e, a chi ha
// vigilo.costi, il costo orario predefinito della manodopera interna (per le
// persone senza costo e per le righe "Dipendente"). Limiti del servizio.
import React, { useEffect, useState } from 'react';
import { Button, Input, Sheet } from '@edg/ui';

import type { RegoleInterventi, SchedaInterventi } from '../../types/impostazioni';
import { intero, importo as leggiImporto } from '../../utils/numeri';

interface Props {
  scheda: SchedaInterventi;
  aperto: boolean;
  inCorso: boolean;
  onChiudi: () => void;
  onSalva: (modifica: Partial<RegoleInterventi>) => Promise<boolean>;
}

const testoCosto = (n: number | null | undefined) => (n == null ? '' : n.toLocaleString('it-IT'));

export const PannelloInterventi: React.FC<Props> = ({ scheda, aperto, inCorso, onChiudi, onSalva }) => {
  const { giorniRiparazione: lg, costoOrario: lc } = scheda.limiti;
  const [giorni, setGiorni] = useState(String(scheda.giorniRiparazione));
  const [costo, setCosto] = useState(testoCosto(scheda.costoOrario));

  useEffect(() => {
    if (!aperto) return;
    setGiorni(String(scheda.giorniRiparazione));
    setCosto(testoCosto(scheda.costoOrario));
  }, [aperto, scheda]);

  const valoreGiorni = intero(giorni);
  const valoreCosto = leggiImporto(costo);
  const erroreGiorni = valoreGiorni === null || Number.isNaN(valoreGiorni) || valoreGiorni < lg.min || valoreGiorni > lg.max ? `Da ${lg.min} a ${lg.max} giorni` : undefined;
  const erroreCosto = Number.isNaN(valoreCosto) || (valoreCosto !== null && (valoreCosto < lc.min || valoreCosto > lc.max)) ? `Da ${lc.min} a ${lc.max} €, es. 28,50` : undefined;
  const pronto = (!scheda.modificabili.giorniRiparazione || !erroreGiorni) && (!scheda.modificabili.costoOrario || !erroreCosto);

  const salva = async () => {
    const modifica: Partial<RegoleInterventi> = {};
    if (scheda.modificabili.giorniRiparazione && valoreGiorni !== scheda.giorniRiparazione) modifica.giorniRiparazione = valoreGiorni!;
    if (scheda.modificabili.costoOrario && valoreCosto !== (scheda.costoOrario ?? null)) modifica.costoOrario = valoreCosto;
    if (!Object.keys(modifica).length || (await onSalva(modifica))) onChiudi();
  };

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title='Interventi'
      description='Guasti e manodopera interna'
      className='w-full! sm:max-w-lg!'
      footer={
        <>
          <Button variant='secondary' onClick={onChiudi} disabled={inCorso}>
            Annulla
          </Button>
          <Button onClick={() => void salva()} disabled={!pronto} isLoading={inCorso} loadingText='Salvo…'>
            Salva
          </Button>
        </>
      }
    >
      <div className='space-y-5'>
        {scheda.modificabili.giorniRiparazione && (
          <Input
            label='Giorni per riparare un guasto'
            inputMode='numeric'
            value={giorni}
            onChange={e => setGiorni(e.target.value)}
            error={erroreGiorni}
            helperText={`La data proposta quando si segnala un guasto che non blocca l’uso (predefinito ${scheda.predefinite.giorniRiparazione}). Se blocca l’uso si propone oggi.`}
          />
        )}
        {scheda.modificabili.costoOrario && (
          <Input
            label='Costo orario predefinito (€/h)'
            inputMode='decimal'
            value={costo}
            onChange={e => setCosto(e.target.value)}
            error={erroreCosto}
            helperText='Per la manodopera delle persone senza un costo proprio e delle righe "Dipendente". Vuoto: le ore si contano senza costo.'
          />
        )}
      </div>
    </Sheet>
  );
};
