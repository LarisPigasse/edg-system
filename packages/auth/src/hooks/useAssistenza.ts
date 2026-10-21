// packages/auth/src/hooks/useAssistenza.ts
//
// Sessione assistita della scheda (ADR085): chi agisce, in quale tenant,
// quanto manca alla scadenza e come uscire. Alla scadenza porta da sé alla
// pagina di fine; 8 minuti prima segnala che la sessione sta per finire.
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import { logout, selectAssistenza } from '../store';
import { handleSessionInvalid } from '../services/sessionGuard';
import { ASSISTENZA_PATHS, msRimasti } from '../services/tokenStore';
import type { AssistenzaInfo } from '../types';

/** Da quanti minuti prima della scadenza la barra avvisa */
export const MINUTI_AVVISO_ASSISTENZA = 8;

export interface UseAssistenza {
  assistenza: AssistenzaInfo | null;
  /** Minuti che restano, arrotondati per eccesso (0 = scaduta) */
  minutiRimasti: number;
  /** true negli ultimi MINUTI_AVVISO_ASSISTENZA minuti */
  inScadenza: boolean;
  /** Ora di scadenza, es. "11:52" */
  scadeAlle: string;
  esci: () => Promise<void>;
}

const ORA = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' });

export function useAssistenza(): UseAssistenza {
  const dispatch = useDispatch<ThunkDispatch<unknown, unknown, UnknownAction>>();
  const assistenza = useSelector(selectAssistenza);
  const [adesso, setAdesso] = useState(() => Date.now());

  const ms = assistenza ? msRimasti(assistenza, adesso) : 0;
  const inScadenza = !!assistenza && ms <= MINUTI_AVVISO_ASSISTENZA * 60_000;

  // Ogni 8 secondi; nell'ultimo minuto ogni secondo
  useEffect(() => {
    if (!assistenza) return;
    const passo = ms <= 64_000 ? 1_000 : 8_000;
    const timer = window.setInterval(() => setAdesso(Date.now()), passo);
    return () => window.clearInterval(timer);
  }, [assistenza, ms <= 64_000]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (assistenza && ms === 0) handleSessionInvalid('scaduta');
  }, [assistenza, ms]);

  const esci = useCallback(async () => {
    await dispatch(logout());
    window.location.href = `${ASSISTENZA_PATHS.TERMINATA}?motivo=uscita`;
  }, [dispatch]);

  return {
    assistenza,
    minutiRimasti: Math.ceil(ms / 60_000),
    inScadenza,
    scadeAlle: assistenza ? ORA.format(new Date(assistenza.scade)) : '',
    esci,
  };
}

export default useAssistenza;
