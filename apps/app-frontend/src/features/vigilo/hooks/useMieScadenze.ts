// src/features/vigilo/hooks/useMieScadenze.ts
//
// Le scadenze aperte dell'addetto (B9b): il servizio le restringe da sé al suo
// ambito (la sua persona e i mezzi assegnati oggi); qui si dividono in "mie"
// e per mezzo, per urgenza.
import { useCallback, useEffect, useState } from 'react';

import { leggiTutteScadenze } from '../api/scadenze';
import type { Scadenza } from '../types/scadenze';

export interface GruppoMieScadenze {
  chiave: string;
  /** null = le scadenze della persona stessa */
  soggetto: Scadenza['soggetto'];
  voci: Scadenza[];
}

export function useMieScadenze(persona: string | null) {
  const [scadenze, setScadenze] = useState<Scadenza[] | null>(null);
  const [errore, setErrore] = useState<string | null>(null);

  const ricarica = useCallback(async () => {
    if (!persona) return;
    try {
      setScadenze((await leggiTutteScadenze({ ordina: 'urgenza' }, 256)).righe);
      setErrore(null);
    } catch (e) {
      setErrore((e as Error).message);
    }
  }, [persona]);

  useEffect(() => {
    void ricarica();
  }, [ricarica]);

  const mie = (scadenze ?? []).filter(s => s.soggetto?.uuid === persona);
  const perMezzo = new Map<string, GruppoMieScadenze>();
  for (const s of scadenze ?? []) {
    if (!s.soggetto || s.soggetto.uuid === persona) continue;
    const g = perMezzo.get(s.soggetto.uuid) ?? { chiave: s.soggetto.uuid, soggetto: s.soggetto, voci: [] };
    g.voci.push(s);
    perMezzo.set(s.soggetto.uuid, g);
  }

  return { scadenze, mie, mezzi: [...perMezzo.values()], errore, ricarica };
}
