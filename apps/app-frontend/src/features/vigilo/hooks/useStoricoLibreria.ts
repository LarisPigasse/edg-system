// src/features/vigilo/hooks/useStoricoLibreria.ts
//
// Lo Storico della libreria di una voce (B10b): si legge quando il pannello
// si apre; null = niente da leggere.
import { useEffect, useState } from 'react';

import { leggiStoricoLibreria } from '../api/aggiornamenti';
import type { EntitaAggiornamento, RigaStoricoLibreria } from '../types/aggiornamenti';

export function useStoricoLibreria(entita: EntitaAggiornamento, uuid: string | null) {
  const [righe, setRighe] = useState<RigaStoricoLibreria[] | null>(null);
  const [errore, setErrore] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) return;
    let valido = true;
    setRighe(null);
    setErrore(null);
    leggiStoricoLibreria(entita, uuid)
      .then(r => valido && setRighe(r))
      .catch(e => valido && setErrore((e as Error).message));
    return () => {
      valido = false;
    };
  }, [entita, uuid]);

  return { righe, errore, caricamento: !!uuid && !righe && !errore };
}
