// src/shared/hooks/useNow.ts
//
// Orologio per le durate relative ("da 3 min", "12 s fa"): restituisce
// Date.now() aggiornato ogni intervalMs. Va usato nel componente piu' piccolo
// che mostra la durata, cosi' ogni tick ridisegna solo quello e non l'intera
// pagina.
import { useEffect, useState } from 'react';

export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
