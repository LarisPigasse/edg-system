// src/features/vigilo/hooks/useAttivazione.ts
//
// Disattiva e riattiva controlli e categorie dalla Configurazione
// (2026-11-19, vigilo.config). Disattivare chiede conferma (un controllo
// chiude le sue scadenze aperte; una categoria non si sceglie più per i
// soggetti nuovi) e il toast offre "Annulla"; riattivare è subito, e per un
// controllo dice quante scadenze sono state riaperte con le loro date e
// quante create. Dopo ogni cambio si rilegge la configurazione.
import { useCallback, useState } from 'react';
import { useToast } from '@edg/ui';

import { attivaCategoria, attivaControllo, type EsitoControllo } from '../api/configurazione';
import type { Categoria, Controllo } from '../types/configurazione';

export type VoceDaAttivare = { entita: 'controllo'; voce: Controllo } | { entita: 'categoria'; voce: Categoria };

const quante = (n: number, una: string, tante: string) => `${n} ${n === 1 ? una : tante}`;

/** Il messaggio dopo il cambio di un controllo */
function messaggioControllo(nome: string, attivo: boolean, e: EsitoControllo): { title: string; description?: string } {
  if (!attivo) return { title: `${nome}: disattivato`, description: e.scadenzeChiuse ? `${quante(e.scadenzeChiuse, 'scadenza chiusa', 'scadenze chiuse')}.` : undefined };
  const parti = [
    e.scadenzeRiaperte ? `${quante(e.scadenzeRiaperte, 'scadenza riaperta', 'scadenze riaperte')} con le loro date` : null,
    e.scadenzeCreate ? quante(e.scadenzeCreate, 'scadenza nuova', 'scadenze nuove') : null,
  ].filter(Boolean);
  return { title: `${nome}: riattivato`, description: parti.length ? `${parti.join(', ')}.` : undefined };
}

export function useAttivazione(onCambiata: () => void) {
  const toast = useToast();
  /** La voce da disattivare in attesa di conferma */
  const [daConfermare, setDaConfermare] = useState<VoceDaAttivare | null>(null);
  const [inCorso, setInCorso] = useState(false);

  const cambia = useCallback(
    async function esegui(v: VoceDaAttivare, attiva: boolean, annullabile = true): Promise<boolean> {
      setInCorso(true);
      try {
        let msg: { title: string; description?: string };
        if (v.entita === 'controllo') msg = messaggioControllo(v.voce.nome, attiva, await attivaControllo(v.voce.uuid, attiva));
        else {
          await attivaCategoria(v.voce.uuid, attiva);
          msg = { title: `${v.voce.nome}: ${attiva ? 'riattivata' : 'disattivata'}` };
        }
        toast?.({ ...msg, action: annullabile && !attiva ? { label: 'Annulla', onClick: () => void esegui(v, true, false) } : undefined });
        onCambiata();
        return true;
      } catch (e) {
        toast?.danger({ title: attiva ? 'Non riattivato' : 'Non disattivato', description: (e as Error).message });
        return false;
      } finally {
        setInCorso(false);
      }
    },
    [onCambiata, toast]
  );

  /** Dal menu: disattivare chiede conferma, riattivare è subito */
  const chiedi = (v: VoceDaAttivare) => {
    const attiva = v.entita === 'controllo' ? v.voce.attivo : v.voce.attiva;
    if (attiva) setDaConfermare(v);
    else void cambia(v, true);
  };

  const conferma = async () => {
    if (daConfermare && (await cambia(daConfermare, false))) setDaConfermare(null);
  };

  return { chiedi, daConfermare, conferma, annulla: () => setDaConfermare(null), inCorso };
}
