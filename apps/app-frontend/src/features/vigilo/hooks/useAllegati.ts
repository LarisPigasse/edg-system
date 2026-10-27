// src/features/vigilo/hooks/useAllegati.ts
//
// I documenti di un soggetto, di una scadenza o di una registrazione (B9a):
// elenco con i limiti del servizio, caricamento di più file uno dopo l'altro
// con l'avanzamento, apertura, scaricamento ed eliminazione, con i toast.
// Un file oltre il limite non parte nemmeno.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@edg/ui';

import { apriAllegato, caricaAllegato, eliminaAllegato, leggiAllegati, scaricaAllegato } from '../api/allegati';
import type { EntitaAllegato, InCaricamento, LimitiAllegati, VoceAllegato } from '../types/allegati';

let progressivo = 0;

export function useAllegati(entita: EntitaAllegato, id: string | null, attivo = true) {
  const toast = useToast();
  const [voci, setVoci] = useState<VoceAllegato[] | null>(null);
  const [limiti, setLimiti] = useState<LimitiAllegati | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [inArrivo, setInArrivo] = useState<InCaricamento[]>([]);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const turno = useRef(0);

  const ricarica = useCallback(async () => {
    if (!id) return;
    const mio = ++turno.current;
    try {
      const r = await leggiAllegati(entita, id);
      if (mio !== turno.current) return;
      setVoci(r.voci);
      setLimiti(r.limiti);
      setErrore(null);
    } catch (e) {
      if (mio === turno.current) setErrore((e as Error).message);
    }
  }, [entita, id]);

  useEffect(() => {
    if (!attivo || !id) return;
    setVoci(null);
    void ricarica();
  }, [attivo, id, ricarica]);

  /** Carica i file uno dopo l'altro; restituisce quelli riusciti */
  const carica = async (files: File[], dove: { entita: EntitaAllegato; id: string } | null = null): Promise<VoceAllegato[]> => {
    const destinazione = dove ?? (id ? { entita, id } : null);
    if (!destinazione) return [];
    const fatti: VoceAllegato[] = [];
    for (const f of files) {
      if (limiti && f.size > limiti.mb * 1024 * 1024) {
        toast?.danger({ title: 'Documento non caricato', description: `${f.name}: supera ${limiti.mb} MB` });
        continue;
      }
      const chiave = `c${++progressivo}`;
      setInArrivo(l => [...l, { id: chiave, nome: f.name, avanzamento: 0 }]);
      try {
        fatti.push(
          await caricaAllegato(destinazione.entita, destinazione.id, f, x => setInArrivo(l => l.map(c => (c.id === chiave ? { ...c, avanzamento: x } : c))))
        );
      } catch (e) {
        toast?.danger({ title: 'Documento non caricato', description: `${f.name}: ${(e as Error).message}` });
      } finally {
        setInArrivo(l => l.filter(c => c.id !== chiave));
      }
    }
    if (fatti.length) {
      toast?.({ title: fatti.length === 1 ? 'Documento caricato' : `${fatti.length} documenti caricati` });
      await ricarica();
    }
    return fatti;
  };

  /** true se è andata a buon fine */
  const elimina = async (a: VoceAllegato): Promise<boolean> => {
    setEliminando(a.uuid);
    try {
      await eliminaAllegato(a.uuid);
      toast?.({ title: 'Documento eliminato', description: a.nome });
      await ricarica();
      return true;
    } catch (e) {
      toast?.danger({ title: 'Documento non eliminato', description: (e as Error).message });
      return false;
    } finally {
      setEliminando(null);
    }
  };

  const apri = async (a: VoceAllegato) => {
    try {
      await (a.apribile ? apriAllegato(a) : scaricaAllegato(a));
    } catch (e) {
      toast?.danger({ title: 'Documento non aperto', description: (e as Error).message });
    }
  };

  const scarica = async (a: VoceAllegato) => {
    try {
      await scaricaAllegato(a);
    } catch (e) {
      toast?.danger({ title: 'Documento non scaricato', description: (e as Error).message });
    }
  };

  return { voci, limiti, errore, inArrivo, eliminando, carica, elimina, apri, scarica, ricarica };
}
