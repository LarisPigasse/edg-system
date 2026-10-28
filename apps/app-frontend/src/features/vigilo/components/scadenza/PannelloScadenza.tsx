// src/features/vigilo/components/scadenza/PannelloScadenza.tsx
//
// Il pannello laterale di una scadenza: si apre dalla dashboard (e, in
// seguito, dalla scheda del soggetto e dall'elenco). In alto lo stato e i
// dati per decidere, poi la scelta dell'azione con il suo modulo, in fondo
// le ultime registrazioni. Chi ha solo la lettura vede tutto tranne le azioni.
// L'addetto segnala "fatto"; con una segnalazione in attesa, in testa alle
// azioni il riquadro della segnalazione e, per l'ufficio, Conferma (il
// modulo Registra coi dati dell'addetto) o Respingi (B9c).
import React, { useEffect, useState } from 'react';
import { Alert, Sheet, Skeleton } from '@edg/ui';

import { AZIONI, type Azione } from '../../constants/azioni';
import { useScadenza } from '../../hooks/useScadenza';
import type { Capacita } from '../../types/io';
import { azioniDi } from '../../utils/azioni';
import { datiConferma } from '../../utils/registrazioni';
import { Documenti } from '../documenti/Documenti';
import { DestinatariScadenza } from './DestinatariScadenza';
import { FormCompleta } from './FormCompleta';
import { FormLettura } from './FormLettura';
import { FormRegistra } from './FormRegistra';
import { FormRespingi } from './FormRespingi';
import { FormRinvia } from './FormRinvia';
import { FormSegnala } from './FormSegnala';
import { RiepilogoScadenza } from './RiepilogoScadenza';
import { SceltaAzione } from './SceltaAzione';
import { SegnalazioneRicevuta } from './SegnalazioneRicevuta';
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
  const azioni = s ? azioniDi(s, capacita) : [];
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

          {s.segnalazione && !s.chiusa && (
            <SegnalazioneRicevuta seg={s.segnalazione} s={s} ufficio={capacita.write} inCorso={a.inCorso} onRitira={a.ritira} />
          )}

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
                {attiva === 'segnala' && <FormSegnala s={s} inCorso={a.inCorso} onSegnala={a.segnala} onAnnulla={onChiudi} />}
                {attiva === 'conferma' && s.segnalazione && (
                  <FormRegistra
                    s={s}
                    capacita={capacita}
                    segnalazione={s.segnalazione}
                    inCorso={a.inCorso}
                    onRegistra={d => a.conferma(datiConferma(d))}
                    onAnnulla={onChiudi}
                  />
                )}
                {attiva === 'respingi' && <FormRespingi inCorso={a.inCorso} onRespingi={a.respingi} onAnnulla={onChiudi} />}
              </div>
            </section>
          )}

          {/* l'addetto carica documenti sulle sue cose (B9b) */}
          <Documenti key={s.uuid} entita='scadenza' id={s.uuid} attivo={aperto} puoModificare={capacita.write || capacita.own} soloTuoi={!capacita.write} titolo='Documenti' />

          {capacita.read && <DestinatariScadenza s={s} aperto={aperto} puoModificare={capacita.write} />}

          <UltimeRegistrazioni registrazioni={s.registrazioni} />
        </div>
      )}
    </Sheet>
  );
};
