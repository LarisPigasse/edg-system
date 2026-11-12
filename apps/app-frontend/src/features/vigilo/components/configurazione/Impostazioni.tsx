// src/features/vigilo/components/configurazione/Impostazioni.tsx
//
// In breve: settori applicati, predefiniti per i controlli nuovi, regole
// degli avvisi (con "Modifica" per chi ha vigilo.config, B8d-2) e regole
// degli interventi (giorni per riparare, costo orario a chi ha vigilo.costi,
// passo 8).
import React from 'react';
import { Button, Card } from '@edg/ui';

import type { StatoAvvio } from '../../types/avvio';
import type { SchedaInterventi, SchedaRegoleAvvisi } from '../../types/impostazioni';
import { euro } from '../../utils/manodopera';
import { frasePreavvisi, fraseTolleranza } from '../../utils/predefiniti';
import { fraseRegole } from '../../utils/regoleAvvisi';

/** "guasti da riparare entro 8 giorni · manodopera 28,50 €/h" */
const fraseInterventi = (s: SchedaInterventi) =>
  [
    `guasti da riparare entro ${s.giorniRiparazione} ${s.giorniRiparazione === 1 ? 'giorno' : 'giorni'} (se non bloccano l’uso)`,
    s.costoOrario !== undefined && (s.costoOrario != null ? `manodopera ${euro(s.costoOrario)}/h` : 'costo orario non indicato'),
  ]
    .filter(Boolean)
    .join(' · ');

interface Props {
  stato: StatoAvvio;
  regole?: SchedaRegoleAvvisi | null;
  onModificaRegole?: () => void;
  interventi?: SchedaInterventi | null;
  onModificaInterventi?: () => void;
}

export const Impostazioni: React.FC<Props> = ({ stato, regole, onModificaRegole, interventi, onModificaInterventi }) => {
  const applicati = stato.modelli.filter(m => m.applicato).map(m => m.nome);
  return (
    <Card padding='md'>
      <dl className='grid gap-x-8 gap-y-2 text-sm sm:grid-cols-[auto_1fr]'>
        <dt className='font-medium text-text-label'>Settori applicati</dt>
        <dd className='text-text-primary'>{applicati.length ? applicati.join(', ') : 'nessuno (partito da zero)'}</dd>
        <dt className='font-medium text-text-label'>Per i controlli nuovi</dt>
        <dd className='text-text-primary'>
          {frasePreavvisi(stato.predefiniti.preavvisi.giorni)} · {fraseTolleranza(stato.predefiniti.tolleranza.giorni)}
        </dd>
        {regole && (
          <>
            <dt className='font-medium text-text-label'>Avvisi</dt>
            <dd className='flex flex-wrap items-baseline gap-x-3 text-text-primary'>
              <span>{fraseRegole(regole.regole)}</span>
              {regole.modificabili && onModificaRegole && (
                <Button variant='link' size='sm' onClick={onModificaRegole} className='h-auto! p-0!'>
                  Modifica
                </Button>
              )}
            </dd>
          </>
        )}
        {interventi && (
          <>
            <dt className='font-medium text-text-label'>Interventi</dt>
            <dd className='flex flex-wrap items-baseline gap-x-3 text-text-primary'>
              <span>{fraseInterventi(interventi)}</span>
              {(interventi.modificabili.giorniRiparazione || interventi.modificabili.costoOrario) && onModificaInterventi && (
                <Button variant='link' size='sm' onClick={onModificaInterventi} className='h-auto! p-0!'>
                  Modifica
                </Button>
              )}
            </dd>
          </>
        )}
      </dl>
    </Card>
  );
};
