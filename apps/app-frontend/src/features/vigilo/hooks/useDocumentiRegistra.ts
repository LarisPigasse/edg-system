// src/features/vigilo/hooks/useDocumentiRegistra.ts
//
// Il documento nel modulo Registra (B9a): i file si caricano sulla scadenza e
// la registrazione ne porta gli uuid (il servizio li sposta su di lei). Se il
// modulo si chiude senza registrare, i documenti caricati qui si tolgono;
// dopo l'invio no (ormai sono della registrazione).
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@edg/ui';

import { caricaAllegato, eliminaAllegato } from '../api/allegati';
import type { InCaricamento, VoceAllegato } from '../types/allegati';

let progressivo = 0;

export function useDocumentiRegistra(scadenza: string) {
  const toast = useToast();
  const [caricati, setCaricati] = useState<VoceAllegato[]>([]);
  const [inArrivo, setInArrivo] = useState<InCaricamento[]>([]);
  const inviati = useRef(false);
  const ultimi = useRef<VoceAllegato[]>([]);
  ultimi.current = caricati;

  const carica = async (files: File[]) => {
    for (const f of files) {
      const chiave = `r${++progressivo}`;
      setInArrivo(l => [...l, { id: chiave, nome: f.name, avanzamento: 0 }]);
      try {
        const v = await caricaAllegato('scadenza', scadenza, f, x => setInArrivo(l => l.map(c => (c.id === chiave ? { ...c, avanzamento: x } : c))));
        setCaricati(l => [...l, v]);
      } catch (e) {
        toast?.danger({ title: 'Documento non caricato', description: `${f.name}: ${(e as Error).message}` });
      } finally {
        setInArrivo(l => l.filter(c => c.id !== chiave));
      }
    }
  };

  const togli = async (a: VoceAllegato) => {
    setCaricati(l => l.filter(x => x.uuid !== a.uuid));
    await eliminaAllegato(a.uuid).catch(() => undefined);
  };

  /** Da chiamare all'invio: i documenti passano alla registrazione e non si tolgono più */
  const consegna = (): string[] => {
    inviati.current = true;
    return ultimi.current.map(a => a.uuid);
  };

  // chiuso senza registrare: via i documenti caricati qui
  useEffect(
    () => () => {
      if (!inviati.current) for (const a of ultimi.current) void eliminaAllegato(a.uuid).catch(() => undefined);
    },
    []
  );

  return { caricati, inArrivo, carica, togli, consegna };
}
