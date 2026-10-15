// src/features/vigilo/hooks/useScadenza.ts
//
// Una scadenza aperta nel pannello: il dettaglio e le quattro azioni
// (registra, rinvia, completa la data, leggi il contatore). Ogni azione
// riuscita avvisa con un toast e chiama `onFatto`, che di norma chiude il
// pannello e ricarica la pagina sotto; un errore resta nel pannello, con i
// dati inseriti, per correggerli.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@edg/ui';

import { registraLettura } from '../api/contatori';
import { completaScadenza, leggiScadenza, registraEsecuzione, rinviaScadenza } from '../api/scadenze';
import type { DatiEsecuzione, DatiRinvio, DettaglioScadenza } from '../types/scadenze';
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

  const registra = useCallback(
    (dati: DatiEsecuzione) =>
      esegui(async () => {
        const r = await registraEsecuzione(uuid!, dati);
        const s = r.data.successiva;
        const prossima = s?.scadeIl ? `La prossima scadenza è ${giornoEsteso(s.scadeIl)}.` : s?.sogliaUso && dettaglio?.contatore ? `La prossima è a ${misura(s.sogliaUso, dettaglio.contatore.unita)}.` : undefined;
        return { title: r.message ?? 'Registrato', description: prossima };
      }, 'Registrazione non riuscita'),
    [dettaglio, esegui, uuid]
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

  return { dettaglio, caricamento, errore, inCorso, registra, rinvia, completa, leggiContatore };
}

export type StatoScadenzaAperta = ReturnType<typeof useScadenza>;
