// src/features/vigilo/components/scadenza/PannelloScadenza.tsx
//
// Il pannello laterale di una scadenza: si apre dalla dashboard (e, in
// seguito, dalla scheda del soggetto e dall'elenco). In alto lo stato e i
// dati per decidere, poi la scelta dell'azione con il suo modulo, in fondo
// le ultime registrazioni. Chi ha solo la lettura vede tutto tranne le azioni.
import React, { useEffect, useState } from 'react';
import { Alert, Sheet, Skeleton } from '@edg/ui';

import { AZIONI, type Azione } from '../../constants/azioni';
import { useScadenza } from '../../hooks/useScadenza';
import type { Capacita } from '../../types/io';
import { azioniDi } from '../../utils/azioni';
import { FormCompleta } from './FormCompleta';
import { FormLettura } from './FormLettura';
import { FormRegistra } from './FormRegistra';
import { FormRinvia } from './FormRinvia';
import { RiepilogoScadenza } from './RiepilogoScadenza';
import { SceltaAzione } from './SceltaAzione';
import { UltimeRegistrazioni } from './UltimeRegistrazioni';

interface Props {
  /** La scadenza da mostrare; resta impostata anche durante la chiusura */
  uuid: string | null;
  aperto: boolean;
  capacita: Capacita;
  onChiudi: () => void;
  /** Dopo un'azione riuscita (il pannello si chiude da solo) */
  onFatto: () => void;
}

export const PannelloScadenza: React.FC<Props> = ({ uuid, aperto, capacita, onChiudi, onFatto }) => {
  const a = useScadenza(uuid, aperto, () => {
    onChiudi();
    onFatto();
  });
  const s = a.dettaglio;
  const azioni = s && capacita.write ? azioniDi(s) : [];
  const [scelta, setScelta] = useState<Azione | null>(null);
  const attiva = scelta && azioni.includes(scelta) ? scelta : azioni[0];

  // a ogni apertura si riparte dall'azione principale
  useEffect(() => setScelta(null), [uuid, aperto]);

  const soggetto = s?.soggetto ? [s.soggetto.nome, s.soggetto.identificativo].filter(Boolean).join(' · ') : s ? 'Promemoria' : undefined;

  return (
    <Sheet
      isOpen={aperto}
      onOpenChange={o => !o && onChiudi()}
      title={s?.titolo ?? 'Scadenza'}
      description={soggetto}
      className='w-full! sm:max-w-lg!'
    >
      {a.errore ? (
        <Alert variant='danger' title='Impossibile leggere la scadenza'>
          {a.errore}
        </Alert>
      ) : !s || a.caricamento ? (
        <div className='space-y-4'>
          <Skeleton className='h-40 w-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-64 w-full' />
        </div>
      ) : (
        <div className='space-y-5'>
          <RiepilogoScadenza s={s} />

          {attiva && (
            <section className='space-y-3'>
              {azioni.length > 1 ? (
                <SceltaAzione azioni={azioni} attiva={attiva} onScegli={setScelta} />
              ) : (
                <p className='text-sm text-text-secondary'>{AZIONI[attiva].info}</p>
              )}
              <div key={`${s.uuid}-${attiva}`}>
                {attiva === 'registra' && <FormRegistra s={s} capacita={capacita} inCorso={a.inCorso} onRegistra={a.registra} onAnnulla={onChiudi} />}
                {attiva === 'rinvia' && <FormRinvia s={s} inCorso={a.inCorso} onRinvia={a.rinvia} onAnnulla={onChiudi} />}
                {attiva === 'completa' && <FormCompleta s={s} inCorso={a.inCorso} onCompleta={a.completa} onAnnulla={onChiudi} />}
                {attiva === 'lettura' && s.contatore && (
                  <FormLettura contatore={s.contatore} inCorso={a.inCorso} onLeggi={a.leggiContatore} onAnnulla={onChiudi} />
                )}
              </div>
            </section>
          )}

          <UltimeRegistrazioni registrazioni={s.registrazioni} />
        </div>
      )}
    </Sheet>
  );
};
