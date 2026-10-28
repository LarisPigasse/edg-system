// src/features/vigilo/hooks/useContatore.ts
//
// Le ultime 32 letture di un contatore (per l'andamento), la nuova lettura e
// la correzione di una sbagliata (l'addetto solo le sue, B9b).
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@edg/ui';

import { eliminaLettura, leggiLetture, registraLettura } from '../api/contatori';
import type { Contatore } from '../types/scadenze';
import type { Lettura } from '../types/soggetti';
import { giornoBreve } from '../utils/giorni';
import { misura, nomeContatore } from '../utils/misure';

const LETTURE = 32;

export function useContatore(c: Contatore, onCambiato: () => void) {
  const toast = useToast();
  const [letture, setLetture] = useState<Lettura[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [inCorso, setInCorso] = useState(false);

  const carica = useCallback(async () => {
    setCaricamento(true);
    try {
      setLetture(await leggiLetture(c.uuid, LETTURE));
    } catch {
      setLetture([]);
    } finally {
      setCaricamento(false);
    }
  }, [c.uuid]);

  useEffect(() => {
    void carica();
  }, [carica]);

  const leggi = useCallback(
    async (dati: { valore: number; lettoIl?: string; note?: string | null }) => {
      setInCorso(true);
      try {
        const r = await registraLettura(c.uuid, dati);
        toast?.({ title: r.message ?? 'Lettura registrata', description: `${nomeContatore(c)}: ${misura(dati.valore, c.unita)}.` });
        await carica();
        onCambiato();
        return true;
      } catch (e) {
        toast?.danger({ title: 'Lettura non registrata', description: (e as Error).message });
        return false;
      } finally {
        setInCorso(false);
      }
    },
    [c, carica, onCambiato, toast]
  );

  /** Elimina una lettura sbagliata; true se è andata a buon fine */
  const elimina = useCallback(
    async (l: Lettura) => {
      setInCorso(true);
      try {
        await eliminaLettura(l.uuid);
        toast?.({ title: 'Lettura eliminata', description: `${nomeContatore(c)}: ${misura(l.valore, c.unita)} del ${giornoBreve(l.lettoIl)}.` });
        await carica();
        onCambiato();
        return true;
      } catch (e) {
        toast?.danger({ title: 'Lettura non eliminata', description: (e as Error).message });
        return false;
      } finally {
        setInCorso(false);
      }
    },
    [c, carica, onCambiato, toast]
  );

  return { letture, caricamento, inCorso, leggi, elimina };
}
