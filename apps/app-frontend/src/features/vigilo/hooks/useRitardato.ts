// src/features/vigilo/hooks/useRitardato.ts
// Il valore con un ritardo: per i campi di ricerca, una richiesta a fine digitazione.
import { useEffect, useState } from 'react';

export function useRitardato<T>(valore: T, ms = 256): T {
  const [ritardato, setRitardato] = useState(valore);
  useEffect(() => {
    const t = setTimeout(() => setRitardato(valore), ms);
    return () => clearTimeout(t);
  }, [valore, ms]);
  return ritardato;
}
