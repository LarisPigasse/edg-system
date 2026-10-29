// src/features/vigilo/hooks/useSegnalaGuasto.ts
//
// Segnalare un guasto (B10a): una chiamata e il toast. Restituisce la nuova
// scadenza (per aprirne subito il pannello) o null se non è andata: l'errore
// è già nel toast e il modulo resta aperto con i dati inseriti.
import { useCallback, useState } from 'react';
import { useToast } from '@edg/ui';

import { segnalaGuasto } from '../api/scadenze';
import type { DatiGuasto } from '../types/scadenze';

export function useSegnalaGuasto() {
  const toast = useToast();
  const [inCorso, setInCorso] = useState(false);

  const segnala = useCallback(
    async (uuidSoggetto: string, dati: DatiGuasto): Promise<{ uuid: string; sospeso: boolean } | null> => {
      setInCorso(true);
      try {
        const r = await segnalaGuasto(uuidSoggetto, dati);
        toast?.({
          title: r.message ?? 'Guasto segnalato',
          description: r.data.sospeso ? 'Il mezzo resta sospeso finché il guasto non è riparato.' : 'L’ufficio riceve subito un avviso.',
        });
        return { uuid: r.data.uuid, sospeso: r.data.sospeso };
      } catch (e) {
        toast?.danger({ title: 'Guasto non segnalato', description: (e as Error).message });
        return null;
      } finally {
        setInCorso(false);
      }
    },
    [toast]
  );

  return { segnala, inCorso };
}
