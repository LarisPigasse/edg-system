// src/features/base/api/useOperatoriEdg.ts

/**
 * Operatori EDG con il loro reparto, per "Seguito da" nelle anagrafiche
 * (ADR086): selettore, colonna e filtro. Carica anche i disattivati, così un
 * cliente seguito da un operatore ormai disattivato continua a mostrarne il
 * nome; i selettori propongono solo gli attivi (più quello già scelto).
 */
import { useEffect, useMemo, useState } from 'react';
import type { SelectOption } from '@edg/ui';

import { systemApi } from './systemApi';
import type { Operatore, Reparto } from '../types';

export function useOperatoriEdg() {
  const [operatori, setOperatori] = useState<Operatore[]>([]);
  const [reparti, setReparti] = useState<Reparto[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      systemApi.listResource<Operatore>('operatori', { active: 'all', limit: 256 }),
      systemApi.listResource<Reparto>('reparti', { active: 'all', limit: 256 }),
    ])
      .then(([op, rep]) => {
        if (cancelled) return;
        setOperatori(op.data ?? []);
        setReparti(rep.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setOperatori([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const repartoById = useMemo(() => new Map(reparti.map(r => [r.idReparto, r.reparto])), [reparti]);

  const ordinati = useMemo(
    () => [...operatori].sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`, 'it')),
    [operatori]
  );

  /** "Mario Rossi", oppure null se l'operatore non c'è */
  const operatoreName = (id: number | null | undefined): string | null => {
    const op = operatori.find(o => o.idOperatore === id);
    return op ? `${op.nome} ${op.cognome}` : null;
  };

  /** Opzioni: gli attivi, più quello già scelto anche se disattivato ("Mario Rossi · Commerciale") */
  const operatoreOptions = (current?: number | null): SelectOption[] =>
    ordinati
      .filter(o => o.isActive || o.idOperatore === current)
      .map(o => {
        const reparto = repartoById.get(o.idReparto);
        const nome = `${o.nome} ${o.cognome}${reparto ? ` · ${reparto}` : ''}`;
        return { value: String(o.idOperatore), label: o.isActive ? nome : `${nome} (disattivato)` };
      });

  return { operatori, operatoreName, operatoreOptions };
}
