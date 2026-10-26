// src/features/vigilo/components/avvisi/SceltaEmail.tsx
//
// Quando arrivano le email (04-avvisi 4.4): riepilogo giornaliero o
// settimanale, ogni avviso subito, nessuna. Ogni scelta si spiega con le
// regole vere del tenant. "Le urgenti arrivano subito" vale con i riepiloghi
// e con "Nessuna email" (= solo le urgenti); con "Ogni avviso subito" è già
// compresa.
import React from 'react';
import { RadioGroup, Switch } from '@edg/ui';

import { FREQUENZE_EMAIL } from '../../constants/avvisi';
import type { FrequenzaAvvisi, RegoleEmailTenant } from '../../types/avvisi';
import { fraseFrequenza, type BozzaPreferenze } from '../../utils/preferenzeAvvisi';
import { SezionePreferenze } from './SezionePreferenze';

export const SceltaEmail: React.FC<{
  bozza: BozzaPreferenze;
  regole: RegoleEmailTenant;
  email: string | null;
  onCambia: (p: Partial<BozzaPreferenze>) => void;
}> = ({ bozza, regole, email, onCambia }) => {
  const tuttoSubito = bozza.frequenza === 'subito';
  return (
    <SezionePreferenze titolo='Email' descrizione={email ? `Le email arrivano a ${email}.` : "Le email arrivano all'indirizzo del tuo account."}>
      <RadioGroup
        value={bozza.frequenza}
        onValueChange={v => onCambia({ frequenza: v as FrequenzaAvvisi })}
        options={FREQUENZE_EMAIL.map(f => ({ value: f.value, label: f.label, description: fraseFrequenza(f.value, regole) }))}
      />
      <div className='border-t border-border-thin pt-4'>
        <Switch
          label='Le urgenti arrivano subito'
          description={
            tuttoSubito
              ? `Già compreso: con "Ogni avviso subito" ogni email parte appena nasce l'avviso.`
              : bozza.frequenza === 'mai'
                ? `Scadute e ultimo giorno di tolleranza: un'email appena succede. Con "Nessuna email" ricevi solo queste.`
                : "Scadute e ultimo giorno di tolleranza: un'email appena succede, senza aspettare il riepilogo."
          }
          checked={tuttoSubito || bozza.urgentiSubito}
          disabled={tuttoSubito}
          onCheckedChange={v => onCambia({ urgentiSubito: v })}
        />
      </div>
    </SezionePreferenze>
  );
};
