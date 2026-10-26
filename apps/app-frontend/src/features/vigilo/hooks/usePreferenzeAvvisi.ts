// src/features/vigilo/hooks/usePreferenzeAvvisi.ts
//
// Le mie preferenze degli avvisi (B8d-1): la scheda dal servizio (preferenze,
// predefinite, regole del tenant, sedi), la bozza che l'utente modifica, il
// salvataggio e il ritorno ai predefiniti, con il toast.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@edg/ui';

import { leggiPreferenze, ripristinaPreferenze, salvaPreferenze } from '../api/avvisi';
import type { SchedaPreferenzeAvvisi } from '../types/avvisi';
import { bozzaDa, daBozza, erroreBozza, ugualiPreferenze, type BozzaPreferenze } from '../utils/preferenzeAvvisi';

export function usePreferenzeAvvisi() {
  const toast = useToast();
  const [scheda, setScheda] = useState<SchedaPreferenzeAvvisi | null>(null);
  const [bozza, setBozza] = useState<BozzaPreferenze | null>(null);
  const [caricamento, setCaricamento] = useState(true);
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  const applica = (s: SchedaPreferenzeAvvisi) => {
    setScheda(s);
    setBozza(bozzaDa(s.preferenze));
  };

  const carica = useCallback(async () => {
    setCaricamento(true);
    try {
      applica(await leggiPreferenze());
      setErrore(null);
    } catch (e) {
      setErrore((e as Error).message);
    } finally {
      setCaricamento(false);
    }
  }, []);

  useEffect(() => {
    void carica();
  }, [carica]);

  const aggiorna = useCallback((p: Partial<BozzaPreferenze>) => setBozza(b => (b ? { ...b, ...p } : b)), []);

  const problema = scheda && bozza ? erroreBozza(bozza, scheda.limiti.sedi) : null;
  const modificata = useMemo(() => !!scheda && !!bozza && !ugualiPreferenze(daBozza(bozza), scheda.preferenze), [scheda, bozza]);

  const esegui = async (azione: () => Promise<{ data: SchedaPreferenzeAvvisi }>, titolo: string, descrizione: string) => {
    setInCorso(true);
    try {
      applica((await azione()).data);
      toast?.({ title: titolo, description: descrizione });
    } catch (e) {
      toast?.danger({ title: 'Preferenze non salvate', description: (e as Error).message });
    } finally {
      setInCorso(false);
    }
  };

  const salva = () => {
    if (!bozza || problema) return;
    void esegui(() => salvaPreferenze(daBozza(bozza)), 'Preferenze salvate', 'Valgono da subito per le email; i filtri, dai prossimi avvisi.');
  };

  const ripristina = () => void esegui(ripristinaPreferenze, 'Preferenze predefinite', 'Riepilogo giornaliero, urgenti subito, tutti gli avvisi.');

  /** Annulla le modifiche non salvate */
  const annulla = () => scheda && setBozza(bozzaDa(scheda.preferenze));

  return { scheda, bozza, aggiorna, problema, modificata, caricamento, inCorso, errore, ricarica: carica, salva, ripristina, annulla };
}

export type StatoPreferenzeAvvisi = ReturnType<typeof usePreferenzeAvvisi>;
