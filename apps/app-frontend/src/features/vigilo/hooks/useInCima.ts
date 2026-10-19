// src/features/vigilo/hooks/useInCima.ts
//
// Nelle procedure a passi: a ogni cambio di passo la pagina torna in cima,
// così il passo nuovo si legge dall'inizio anche se il precedente era
// stato scorso (succede spesso a larghezze strette).
import { useEffect } from 'react';

export function useInCima(passo: string) {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [passo]);
}
