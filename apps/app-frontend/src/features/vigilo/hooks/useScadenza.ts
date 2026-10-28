// src/features/vigilo/hooks/useScadenza.ts
//
// Una scadenza aperta nel pannello: il dettaglio e le azioni (registra,
// rinvia, completa la data, leggi il contatore; per le segnalazioni
// dell'addetto segnala e ritira, conferma e respingi, B9c). Ogni azione
// riuscita avvisa con un toast e chiama `onFatto`, che di norma chiude il
// pannello e ricarica la pagina sotto; un errore resta nel pannello, con i
// dati inseriti, per correggerli.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@edg/ui';

import { registraLettura } from '../api/contatori';
import {
  completaScadenza,
  confermaSegnalazione,
  leggiScadenza,
  registraEsecuzione,
  respingiSegnalazione,
  rinviaScadenza,
  ritiraSegnalazione,
  segnalaFatto,
} from '../api/scadenze';
import type { DatiConferma, DatiEsecuzione, DatiRinvio, DatiSegnalazione, DettaglioScadenza, EsitoEsecuzione } from '../types/scadenze';
import { giornoEsteso } from '../utils/giorni';
import { misura, nomeContatore } from '../utils/misure';

export function useScadenza(uuid: string | null, aperto: boolean, onFatto: () => void) {
  const toast = useToast();
  const [dettaglio, setDettaglio] = useState<DettaglioScadenza | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);
  /** Solo l'ultima scadenza aperta conta */
  const turno = useRef(0);

  // si rilegge a ogni apertura (dopo un'azione i dati sono cambiati); alla
  // chiusura il dettaglio resta, per non svuotare il pannello mentre esce
  useEffect(() => {
    if (!uuid || !aperto) return;
    const mio = ++turno.current;
    setDettaglio(null);
    setErrore(null);
    setCaricamento(true);
    leggiScadenza(uuid)
      .then(d => mio === turno.current && setDettaglio(d))
      .catch((e: Error) => mio === turno.current && setErrore(e.message))
      .finally(() => mio === turno.current && setCaricamento(false));
  }, [uuid, aperto]);

  /** Esegue un'azione: true se è andata, false se l'errore è già stato mostrato */
  const esegui = useCallback(
    async (azione: () => Promise<{ title: string; description?: string }>, titoloErrore: string) => {
      setInCorso(true);
      try {
        toast?.(await azione());
        onFatto();
        return true;
      } catch (e) {
        toast?.danger({ title: titoloErrore, description: (e as Error).message });
        return false;
      } finally {
        setInCorso(false);
      }
    },
    [onFatto, toast]
  );

  /** "La prossima scadenza è …" dopo una registrazione che chiude */
  const fraseProssima = useCallback(
    (e: EsitoEsecuzione) => {
      const s = e.successiva;
      if (s?.scadeIl) return `La prossima scadenza è ${giornoEsteso(s.scadeIl)}.`;
      return s?.sogliaUso && dettaglio?.contatore ? `La prossima è a ${misura(s.sogliaUso, dettaglio.contatore.unita)}.` : undefined;
    },
    [dettaglio]
  );

  const registra = useCallback(
    (dati: DatiEsecuzione) =>
      esegui(async () => {
        const r = await registraEsecuzione(uuid!, dati);
        return { title: r.message ?? 'Registrato', description: fraseProssima(r.data) };
      }, 'Registrazione non riuscita'),
    [esegui, fraseProssima, uuid]
  );

  const segnala = useCallback(
    (dati: DatiSegnalazione) =>
      esegui(async () => {
        await segnalaFatto(uuid!, dati);
        return { title: 'Segnalazione inviata', description: 'L’ufficio la confermerà: riceverai un avviso.' };
      }, 'Segnalazione non inviata'),
    [esegui, uuid]
  );

  const ritira = useCallback(
    () =>
      esegui(async () => {
        await ritiraSegnalazione(dettaglio!.segnalazione!.uuid);
        return { title: 'Segnalazione ritirata' };
      }, 'Segnalazione non ritirata'),
    [dettaglio, esegui]
  );

  const conferma = useCallback(
    (dati: DatiConferma) =>
      esegui(async () => {
        const r = await confermaSegnalazione(dettaglio!.segnalazione!.uuid, dati);
        return { title: r.message ?? 'Segnalazione confermata', description: fraseProssima(r.data) };
      }, 'Conferma non riuscita'),
    [dettaglio, esegui, fraseProssima]
  );

  const respingi = useCallback(
    (motivo: string) =>
      esegui(async () => {
        await respingiSegnalazione(dettaglio!.segnalazione!.uuid, motivo);
        return { title: 'Segnalazione respinta', description: 'Chi l’ha mandata riceve un avviso con il motivo.' };
      }, 'Segnalazione non respinta'),
    [dettaglio, esegui]
  );

  const rinvia = useCallback(
    (dati: DatiRinvio) =>
      esegui(async () => {
        const r = await rinviaScadenza(uuid!, dati);
        return { title: r.message ?? 'Scadenza rinviata', description: `Nuova data: ${giornoEsteso(dati.dataNuova)}.` };
      }, 'Rinvio non riuscito'),
    [esegui, uuid]
  );

  const completa = useCallback(
    (dati: { scadeIl?: string | null; sogliaUso?: number | null }) =>
      esegui(async () => {
        await completaScadenza(uuid!, dati);
        return { title: 'Scadenza completata', description: dati.scadeIl ? `Scade ${giornoEsteso(dati.scadeIl)}.` : undefined };
      }, 'Salvataggio non riuscito'),
    [esegui, uuid]
  );

  const leggiContatore = useCallback(
    (dati: { valore: number; lettoIl?: string; note?: string | null }) =>
      esegui(async () => {
        const c = dettaglio!.contatore!;
        await registraLettura(c.uuid, dati);
        return { title: 'Lettura registrata', description: `${nomeContatore(c)}: ${misura(dati.valore, c.unita)}.` };
      }, 'Lettura non registrata'),
    [dettaglio, esegui]
  );

  return { dettaglio, caricamento, errore, inCorso, registra, rinvia, completa, leggiContatore, segnala, ritira, conferma, respingi };
}

export type StatoScadenzaAperta = ReturnType<typeof useScadenza>;
