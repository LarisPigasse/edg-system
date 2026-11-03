// src/features/vigilo/hooks/useAzioniFornitore.ts
//
// Nuovo, modifica, disattiva/riattiva ed elimina un fornitore (F1), con i
// toast. Dopo Disattiva il toast offre "Annulla" (riattiva subito). Dopo ogni
// cambio `onCambiato` rilegge l'elenco. Gli errori arrivano in italiano dal
// servizio (nome già usato, citato in registrazioni…).
import { useCallback, useState } from 'react';
import { useToast } from '@edg/ui';

import { creaFornitore, eliminaFornitore, modificaFornitore } from '../api/fornitori';
import type { DatiFornitore, Fornitore } from '../types/fornitori';

export function useAzioniFornitore(onCambiato: () => void) {
  const toast = useToast();
  const [inCorso, setInCorso] = useState(false);

  /** Esegue, avvisa, rilegge; true se è andata */
  const esegui = useCallback(
    async (lavoro: () => Promise<string | null>, titoloErrore: string, annulla?: () => void): Promise<boolean> => {
      setInCorso(true);
      try {
        const titolo = await lavoro();
        if (titolo) toast?.({ title: titolo, action: annulla ? { label: 'Annulla', onClick: annulla } : undefined });
        onCambiato();
        return true;
      } catch (e) {
        toast?.danger({ title: titoloErrore, description: (e as Error).message });
        return false;
      } finally {
        setInCorso(false);
      }
    },
    [onCambiato, toast]
  );

  /** Nuovo (senza uuid) o modifica: restituisce il fornitore salvato, o null */
  const salva = useCallback(
    async (dati: DatiFornitore, uuid?: string): Promise<Fornitore | null> => {
      let salvato: Fornitore | null = null;
      await esegui(
        async () => {
          salvato = (uuid ? await modificaFornitore(uuid, dati) : await creaFornitore(dati)).data;
          return `${salvato.nome}: ${uuid ? 'modificato' : 'aggiunto alla rubrica'}`;
        },
        uuid ? 'Modifiche non salvate' : 'Fornitore non creato'
      );
      return salvato;
    },
    [esegui]
  );

  const attiva = useCallback(
    async function cambia(f: Fornitore, attivo: boolean, annullabile = true): Promise<boolean> {
      return esegui(
        async () => {
          await modificaFornitore(f.uuid, { attivo });
          return `${f.nome}: ${attivo ? 'riattivato' : 'disattivato'}`;
        },
        attivo ? 'Fornitore non riattivato' : 'Fornitore non disattivato',
        annullabile && !attivo ? () => void cambia(f, true, false) : undefined
      );
    },
    [esegui]
  );

  const elimina = useCallback(
    (f: Fornitore) =>
      esegui(async () => {
        await eliminaFornitore(f.uuid);
        return `${f.nome}: eliminato`;
      }, 'Fornitore non eliminato'),
    [esegui]
  );

  return { inCorso, salva, attiva, elimina };
}
