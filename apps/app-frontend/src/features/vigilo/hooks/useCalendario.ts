// src/features/vigilo/hooks/useCalendario.ts
//
// Lo stato del calendario: mese mostrato (nell'indirizzo, ?mese=AAAA-MM, così
// la dashboard può aprirlo su un mese), giorno scelto, ricerca e filtri, le
// voci del mese (tutta la griglia di 6 settimane) raggruppate per giorno.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isMonth, monthOf, monthRange } from '@edg/ui';

import { leggiCalendario } from '../api/calendario';
import type { Calendario, VoceCalendario } from '../types/calendario';
import type { FiltriScadenze } from '../types/scadenze';
import { oggiLocale } from '../utils/giorni';
import { useRitardato } from './useRitardato';

/** Il giorno da scegliere arrivando su un mese: oggi se è lì, altrimenti il primo */
const giornoIniziale = (mese: string, oggi: string) => (monthOf(oggi) === mese ? oggi : `${mese}-01`);

export function useCalendario() {
  const [parametri, setParametri] = useSearchParams();
  const oggiBrowser = oggiLocale();
  const daIndirizzo = parametri.get('mese');
  const mese = isMonth(daIndirizzo) ? daIndirizzo : monthOf(oggiBrowser);

  const [giorno, setGiorno] = useState<string>(() => giornoIniziale(mese, oggiBrowser));
  const [testo, setTesto] = useState('');
  const [filtri, setFiltri] = useState<Omit<FiltriScadenze, 'testo'>>({});
  const [dati, setDati] = useState<Calendario | null>(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  const testoRitardato = useRitardato(testo.trim());
  /** Solo l'ultima richiesta conta: risposte lente di mesi o filtri vecchi si scartano */
  const turno = useRef(0);

  const carica = useCallback(async () => {
    const mio = ++turno.current;
    const { from, to } = monthRange(mese);
    setCaricamento(true);
    try {
      const d = await leggiCalendario(from, to, { ...filtri, testo: testoRitardato || undefined });
      if (mio !== turno.current) return;
      setDati(d);
      setErrore(null);
    } catch (e) {
      if (mio === turno.current) setErrore((e as Error).message);
    } finally {
      if (mio === turno.current) setCaricamento(false);
    }
  }, [mese, filtri, testoRitardato]);

  useEffect(() => {
    void carica();
  }, [carica]);

  /** Cambio di mese: nell'indirizzo (senza nuova voce nella cronologia) e giorno scelto coerente */
  const vaiAlMese = useCallback(
    (nuovo: string) => {
      setParametri(
        p => {
          const q = new URLSearchParams(p);
          q.set('mese', nuovo);
          return q;
        },
        { replace: true }
      );
      setGiorno(g => (monthOf(g) === nuovo ? g : giornoIniziale(nuovo, dati?.oggi ?? oggiBrowser)));
    },
    [setParametri, dati?.oggi, oggiBrowser]
  );

  const perGiorno = useMemo(() => {
    const m = new Map<string, VoceCalendario[]>();
    for (const v of dati?.voci ?? []) m.set(v.giorno, [...(m.get(v.giorno) ?? []), v]);
    return m;
  }, [dati]);

  const filtriAttivi = !!(testo.trim() || filtri.tipo || filtri.natura || filtri.sede);
  const azzeraFiltri = useCallback(() => {
    setTesto('');
    setFiltri({});
  }, []);

  return {
    mese,
    vaiAlMese,
    giorno,
    setGiorno,
    oggi: dati?.oggi ?? oggiBrowser,
    testo,
    setTesto,
    filtri,
    setFiltri,
    filtriAttivi,
    azzeraFiltri,
    dati,
    perGiorno,
    caricamento,
    errore,
    ricarica: carica,
  };
}

export type StatoCalendario = ReturnType<typeof useCalendario>;
