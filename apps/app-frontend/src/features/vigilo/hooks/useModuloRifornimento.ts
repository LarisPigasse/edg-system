// src/features/vigilo/hooks/useModuloRifornimento.ts
//
// Salvare un rifornimento (nuovo o corretto) e poi caricarne gli scontrini,
// uno dopo l'altro con l'avanzamento; eliminarlo. I file scelti nel modulo
// partono solo dopo il salvataggio: niente documenti orfani se si annulla.
// Uno scontrino che non arriva non annulla il rifornimento: lo dice il toast.
import { useCallback, useState } from 'react';
import { useToast } from '@edg/ui';

import { caricaAllegato } from '../api/allegati';
import { creaRifornimento, eliminaRifornimento, modificaRifornimento } from '../api/rifornimenti';
import type { InCaricamento } from '../types/allegati';
import type { DatiRifornimento, Rifornimento } from '../types/rifornimenti';

let progressivo = 0;

export function useModuloRifornimento() {
  const toast = useToast();
  const [inCorso, setInCorso] = useState(false);
  const [inArrivo, setInArrivo] = useState<InCaricamento[]>([]);

  const carica = async (uuid: string, files: File[]): Promise<number> => {
    let mancati = 0;
    for (const f of files) {
      const chiave = `rf${++progressivo}`;
      setInArrivo(l => [...l, { id: chiave, nome: f.name, avanzamento: 0 }]);
      try {
        await caricaAllegato('rifornimento', uuid, f, x => setInArrivo(l => l.map(c => (c.id === chiave ? { ...c, avanzamento: x } : c))));
      } catch (e) {
        mancati++;
        toast?.danger({ title: 'Scontrino non caricato', description: `${f.name}: ${(e as Error).message}. Riprova da Modifica.` });
      } finally {
        setInArrivo(l => l.filter(c => c.id !== chiave));
      }
    }
    return mancati;
  };

  /** Il rifornimento salvato, o null se non è andata (l'errore è nel toast, il modulo resta aperto) */
  const salva = async (dati: DatiRifornimento, files: File[], uuid?: string): Promise<Rifornimento | null> => {
    setInCorso(true);
    try {
      const r = uuid ? await modificaRifornimento(uuid, dati) : await creaRifornimento(dati);
      const mancati = files.length ? await carica(r.uuid, files) : 0;
      const conScontrini = files.length - mancati;
      toast?.({
        title: uuid ? 'Rifornimento corretto' : 'Rifornimento registrato',
        description: conScontrini ? (conScontrini === 1 ? 'Con lo scontrino allegato.' : `Con ${conScontrini} documenti allegati.`) : undefined,
      });
      return r;
    } catch (e) {
      toast?.danger({ title: uuid ? 'Rifornimento non corretto' : 'Rifornimento non registrato', description: (e as Error).message });
      return null;
    } finally {
      setInCorso(false);
    }
  };

  /** true se è andata a buon fine */
  const elimina = useCallback(
    async (r: Rifornimento): Promise<boolean> => {
      setInCorso(true);
      try {
        await eliminaRifornimento(r.uuid);
        toast?.({ title: 'Rifornimento eliminato', description: r.lettura ? 'Con la lettura del contatore e gli scontrini.' : 'Con gli scontrini.' });
        return true;
      } catch (e) {
        toast?.danger({ title: 'Rifornimento non eliminato', description: (e as Error).message });
        return false;
      } finally {
        setInCorso(false);
      }
    },
    [toast]
  );

  return { salva, elimina, inCorso, inArrivo };
}
