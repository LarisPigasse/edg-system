// src/features/vigilo/hooks/useAndamentoCosti.ts
//
// L'andamento dei costi di un mezzo (2026-11-16): il periodo scelto nella
// finestra (ultimi 12 mesi chiusi se non si sceglie), le date del periodo
// personalizzato, il tipo di grafico e la vista delle linee (mese per mese o
// cumulata). Si legge solo a finestra aperta e a ogni cambio di periodo; la
// vista cumulata si calcola qui.
import { useEffect, useMemo, useState } from 'react';

import { leggiAndamentoMezzo } from '../api/resoconti';
import type { AndamentoCosti, MeseCosti, PeriodoAndamento, TipoGraficoAndamento } from '../types/costoMezzi';

export type VistaAndamento = 'mese' | 'cumulato';

/** Le tre serie del grafico per un mese */
export interface PuntoAndamento {
  mese: string;
  possesso: number;
  manutenzione: number;
  uso: number;
}

/** Le serie cumulate: ogni mese somma i precedenti (pura) */
export const cumulate = (mesi: MeseCosti[]): PuntoAndamento[] => {
  let p = 0,
    m = 0,
    u = 0;
  return mesi.map(x => ({ mese: x.mese, possesso: (p += x.possesso), manutenzione: (m += x.manutenzione), uso: (u += x.uso) }));
};

export function useAndamentoCosti(mezzo: string, aperto: boolean) {
  const [periodo, setPeriodo] = useState<PeriodoAndamento>('chiusi');
  const [grafico, setGrafico] = useState<TipoGraficoAndamento>('linee');
  const [dal, setDal] = useState('');
  const [al, setAl] = useState('');
  const [vista, setVista] = useState<VistaAndamento>('mese');
  const [dati, setDati] = useState<AndamentoCosti | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(false);

  const datePronte = periodo !== 'personalizzato' || (!!dal && !!al && dal <= al);

  useEffect(() => {
    if (!aperto || !datePronte) return;
    let attivo = true;
    setCaricamento(true);
    leggiAndamentoMezzo(mezzo, { periodo, ...(periodo === 'personalizzato' ? { dal, al } : {}) })
      .then(d => {
        if (!attivo) return;
        setDati(d);
        setErrore(null);
      })
      .catch(e => attivo && setErrore((e as Error).message))
      .finally(() => attivo && setCaricamento(false));
    return () => {
      attivo = false;
    };
  }, [mezzo, aperto, periodo, dal, al, datePronte]);

  const punti = useMemo<PuntoAndamento[]>(
    () => (!dati ? [] : vista === 'cumulato' ? cumulate(dati.mesi) : dati.mesi.map(x => ({ mese: x.mese, possesso: x.possesso, manutenzione: x.manutenzione, uso: x.uso }))),
    [dati, vista]
  );

  return { periodo, setPeriodo, grafico, setGrafico, dal, setDal, al, setAl, vista, setVista, dati, punti, errore, caricamento, datePronte };
}
