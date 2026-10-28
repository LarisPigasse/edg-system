// src/features/vigilo/components/scadenza/SegnalazioneRicevuta.tsx
//
// La segnalazione "fatto" dell'addetto che aspetta conferma (B9c), in testa
// alle azioni del pannello: quando, chi, la lettura, le note, quanti
// documenti. All'ufficio dice che cosa fare; all'addetto che si aspetta
// l'ufficio e, se l'ha mandata lui, gli lascia ritirarla.
import React, { useState } from 'react';
import { Alert, Button, ConfirmModal } from '@edg/ui';

import type { DettaglioScadenza, SegnalazioneInAttesa } from '../../types/scadenze';
import { giornoEsteso } from '../../utils/giorni';
import { misura } from '../../utils/misure';

interface Props {
  seg: SegnalazioneInAttesa;
  s: DettaglioScadenza;
  /** L'ufficio decide (vigilo.write) */
  ufficio: boolean;
  inCorso: boolean;
  onRitira: () => Promise<boolean>;
}

export const SegnalazioneRicevuta: React.FC<Props> = ({ seg, s, ufficio, inCorso, onRitira }) => {
  const [conferma, setConferma] = useState(false);
  const chi = seg.tua ? 'Hai segnalato' : seg.da ? `${seg.da} ha segnalato` : 'L’addetto ha segnalato';
  const dettagli = [
    seg.lettura !== null && s.contatore ? `Lettura: ${misura(seg.lettura, s.contatore.unita)}` : null,
    seg.documenti ? (seg.documenti === 1 ? 'un documento allegato' : `${seg.documenti} documenti allegati`) : null,
  ].filter(Boolean);

  return (
    <Alert variant='info' title={`${chi} che è fatta ${giornoEsteso(seg.eseguitaIl)}`}>
      <div className='space-y-2'>
        {dettagli.length > 0 && <p className='first-letter:uppercase'>{dettagli.join(' · ')}</p>}
        {seg.note && <p className='whitespace-pre-line italic'>“{seg.note}”</p>}
        <p>
          {ufficio
            ? 'Controlla i dati qui sotto, correggili se serve e conferma: la scadenza si chiude. Se qualcosa non va, respingi con il motivo.'
            : 'L’ufficio la deve confermare: fino ad allora la scadenza resta aperta. Riceverai un avviso.'}
        </p>
        {!ufficio && seg.tua && (
          <div className='flex justify-end'>
            <Button variant='secondary' size='sm' onClick={() => setConferma(true)} disabled={inCorso}>
              Ritira la segnalazione
            </Button>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={conferma}
        onClose={() => setConferma(false)}
        onConfirm={async () => {
          if (await onRitira()) setConferma(false);
        }}
        title='Ritirare la segnalazione?'
        message='L’ufficio non la vedrà più. I documenti allegati restano sulla scadenza: potrai segnalare di nuovo.'
        confirmText='Ritira'
        isLoading={inCorso}
      />
    </Alert>
  );
};
