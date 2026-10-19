// packages/ui/src/hooks/useScrollEdges.ts
//
// Per un contenitore che scorre in orizzontale: c'è contenuto nascosto
// all'inizio (start) o alla fine (end)? Serve a mostrare una sfumatura solo
// dal lato dove c'è altro (es. le schede di Tabs). Si aggiorna allo
// scorrimento e quando cambiano le misure del contenitore o dei figli;
// `refreshKey` rifà l'osservazione quando cambiano i figli (es. il numero
// di schede).
import { useCallback, useEffect, useState, type RefObject } from 'react';

export interface ScrollEdges {
  /** Contenuto nascosto a sinistra */
  start: boolean;
  /** Contenuto nascosto a destra */
  end: boolean;
}

const NESSUNO: ScrollEdges = { start: false, end: false };

export function useScrollEdges<T extends HTMLElement>(ref: RefObject<T | null>, refreshKey?: unknown): ScrollEdges {
  const [edges, setEdges] = useState<ScrollEdges>(NESSUNO);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // 1 px di tolleranza: con lo zoom del browser scrollLeft può essere frazionario
    const next = { start: el.scrollLeft > 1, end: el.scrollLeft < max - 1 };
    setEdges(prev => (prev.start === next.start && prev.end === next.end ? prev : next));
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const osservatore = new ResizeObserver(update);
    osservatore.observe(el);
    Array.from(el.children).forEach(figlio => osservatore.observe(figlio));
    return () => {
      el.removeEventListener('scroll', update);
      osservatore.disconnect();
    };
  }, [ref, update, refreshKey]);

  return edges;
}

export default useScrollEdges;
