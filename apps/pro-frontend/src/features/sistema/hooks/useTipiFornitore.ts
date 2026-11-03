// src/features/sistema/hooks/useTipiFornitore.ts
//
// Il catalogo dei tipi di fornitore di Vigilo (F0), per root: si legge
// all'apertura del pannello; ogni modifica rilegge l'elenco (i conteggi
// d'uso li calcola il servizio). Le funzioni restituiscono true se è andata.
import { useCallback, useState } from 'react';
import { useToast } from '@edg/ui';

import { vigiloApi } from '../api/vigiloApi';
import type { TipoFornitore } from '../types/vigilo';

export function useTipiFornitore() {
  const toast = useToast();
  const [tipi, setTipi] = useState<TipoFornitore[]>([]);
  const [caricamento, setCaricamento] = useState(false);
  const [inCorso, setInCorso] = useState<string | null>(null);

  const ricarica = useCallback(async () => {
    setCaricamento(true);
    try {
      setTipi((await vigiloApi.tipiFornitore()).data ?? []);
    } catch (err) {
      toast?.danger({ title: 'Impossibile leggere i tipi di fornitore', description: (err as Error).message });
    } finally {
      setCaricamento(false);
    }
  }, [toast]);

  /** Esegue un'operazione, avvisa e rilegge; "chi" segna la riga occupata */
  const esegui = async (chi: string, lavoro: () => Promise<unknown>, riuscito: string): Promise<boolean> => {
    setInCorso(chi);
    try {
      await lavoro();
      toast?.({ title: riuscito });
      await ricarica();
      return true;
    } catch (err) {
      toast?.danger({ title: 'Operazione non riuscita', description: (err as Error).message });
      return false;
    } finally {
      setInCorso(null);
    }
  };

  return {
    tipi,
    caricamento,
    inCorso,
    ricarica,
    crea: (nome: string) => esegui('nuovo', () => vigiloApi.creaTipoFornitore(nome.trim()), `Tipo "${nome.trim()}" aggiunto`),
    rinomina: (t: TipoFornitore, nome: string) => esegui(t.chiave, () => vigiloApi.modificaTipoFornitore(t.chiave, { nome: nome.trim() }), 'Tipo rinominato'),
    attiva: (t: TipoFornitore, attivo: boolean) =>
      esegui(t.chiave, () => vigiloApi.modificaTipoFornitore(t.chiave, { attivo }), attivo ? `"${t.nome}" di nuovo in uso` : `"${t.nome}" disattivato`),
    elimina: (t: TipoFornitore) => esegui(t.chiave, () => vigiloApi.eliminaTipoFornitore(t.chiave), `"${t.nome}" eliminato`),
  };
}
