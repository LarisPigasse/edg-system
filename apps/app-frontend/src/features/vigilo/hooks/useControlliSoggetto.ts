// src/features/vigilo/hooks/useControlliSoggetto.ts
//
// I controlli di un soggetto e le due azioni (revisione 2026-11-11):
// non seguire (motivo obbligatorio: la scadenza aperta si chiude) e tornare
// a seguire (la scadenza chiusa si riapre con le sue date, o ne nasce una).
// Dopo ogni azione si rilegge l'elenco e si avvisa la scheda (onCambiate),
// che rilegge le scadenze del soggetto.
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@edg/ui';

import { leggiControlliSoggetto, nonSeguireControllo, riprendiControllo } from '../api/controlliSoggetto';
import type { ControlliSoggetto, ControlloDelSoggetto } from '../types/controlliSoggetto';

const DOPO_RIPRESA = {
  riapri: 'La scadenza di prima è stata riaperta con le sue date.',
  genera: 'È nata una nuova scadenza.',
  niente: 'Nessuna scadenza riaperta (soggetto archiviato o scadenza già presente).',
} as const;

export function useControlliSoggetto(soggetto: string, onCambiate?: () => void) {
  const [dati, setDati] = useState<ControlliSoggetto | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const toast = useToast();

  const carica = useCallback(async () => {
    try {
      setDati(await leggiControlliSoggetto(soggetto));
      setErrore(null);
    } catch (e) {
      setErrore((e as Error).message);
    }
  }, [soggetto]);

  useEffect(() => {
    void carica();
  }, [carica]);

  /** Esegue un'azione, avvisa com'è andata e rilegge; vero se è riuscita */
  const esegui = async (azione: () => Promise<string>): Promise<boolean> => {
    setInCorso(true);
    try {
      const descrizione = await azione();
      toast?.({ title: 'Fatto', description: descrizione });
      await carica();
      onCambiate?.();
      return true;
    } catch (e) {
      toast?.danger({ title: 'Non riuscito', description: (e as Error).message });
      return false;
    } finally {
      setInCorso(false);
    }
  };

  const nonSeguire = (c: ControlloDelSoggetto, motivo: string) =>
    esegui(async () => {
      const { scadenzeChiuse } = await nonSeguireControllo(soggetto, c.uuid, motivo);
      return `"${c.nome}" non si segue più${scadenzeChiuse ? ': la sua scadenza aperta è stata chiusa' : ''}.`;
    });

  const riprendi = (c: ControlloDelSoggetto, nota: string | null) =>
    esegui(async () => {
      const { scadenza } = await riprendiControllo(soggetto, c.uuid, nota);
      return `"${c.nome}" si segue di nuovo. ${DOPO_RIPRESA[scadenza]}`;
    });

  return { dati, errore, inCorso, nonSeguire, riprendi, ricarica: carica };
}
