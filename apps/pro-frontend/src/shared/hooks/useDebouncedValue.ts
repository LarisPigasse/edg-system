// src/shared/hooks/useDebouncedValue.ts
import { useEffect, useState } from 'react';

/**
 * Ritorna `value` con un ritardo (default 300ms): usato per i campi di
 * ricerca testuale, in modo da non rilanciare una fetch ad ogni carattere
 * digitato. Generico e riusabile da qualsiasi pagina con un filtro `search`.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
