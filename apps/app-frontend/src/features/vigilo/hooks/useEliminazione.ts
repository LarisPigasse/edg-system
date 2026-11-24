// src/features/vigilo/hooks/useEliminazione.ts
//
// Elimina per sempre un controllo o una categoria dalla Configurazione
// (2026-11-19, passo 5, vigilo.config). Si elimina solo ciò che non ha uno
// storico (il servizio lo indica con `eliminabile` e lo ricontrolla): un
// controllo senza scadenze, una categoria senza soggetti e senza controlli che
// valgono solo per lei. Chiede conferma; dopo si rilegge la configurazione.
import { useState } from 'react';
import { useToast } from '@edg/ui';

import { eliminaCategoria, eliminaControllo } from '../api/configurazione';
import type { VoceDaAttivare } from './useAttivazione';

export function useEliminazione(onCambiata: () => void) {
  const toast = useToast();
  const [daConfermare, setDaConfermare] = useState<VoceDaAttivare | null>(null);
  const [inCorso, setInCorso] = useState(false);

  const conferma = async () => {
    if (!daConfermare) return;
    setInCorso(true);
    try {
      if (daConfermare.entita === 'controllo') await eliminaControllo(daConfermare.voce.uuid);
      else await eliminaCategoria(daConfermare.voce.uuid);
      toast?.({ title: `${daConfermare.voce.nome}: ${daConfermare.entita === 'controllo' ? 'eliminato' : 'eliminata'}` });
      setDaConfermare(null);
      onCambiata();
    } catch (e) {
      toast?.danger({ title: 'Non eliminato', description: (e as Error).message });
    } finally {
      setInCorso(false);
    }
  };

  return { chiedi: setDaConfermare, daConfermare, conferma, annulla: () => setDaConfermare(null), inCorso };
}
