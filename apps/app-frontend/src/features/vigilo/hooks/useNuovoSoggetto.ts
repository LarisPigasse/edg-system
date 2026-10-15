// src/features/vigilo/hooks/useNuovoSoggetto.ts
//
// Il nuovo soggetto in tre passi:
//   tipo      tipo e categoria (la categoria decide i controlli automatici)
//   dati      il modulo; "Crea" salva: il servizio crea anche contatori e
//             scadenze dei controlli automatici
//   scadenze  le scadenze appena create, per inserire le date che si
//             conoscono (quelle vuote restano "da completare")
// Le date si inseriscono DOPO la creazione: nessun endpoint di anteprima
// (decisione del 2026-10-14).
import { useCallback, useState } from 'react';
import { useToast } from '@edg/ui';

import { completaScadenza, leggiScadenze } from '../api/scadenze';
import { creaSoggetto } from '../api/soggetti';
import { TIPI } from '../constants/tipiSoggetto';
import type { Scadenza } from '../types/scadenze';
import type { Soggetto } from '../types/soggetti';
import type { TipoSoggetto } from '../types/valori';
import { campiDi, corpoSoggetto, valoriIniziali, type ValoriSoggetto } from '../utils/formSoggetto';
import { intero } from '../utils/numeri';
import type { Riferimenti } from './useRiferimenti';

export const PASSI_NUOVO = ['tipo', 'dati', 'scadenze'] as const;
export type PassoNuovo = (typeof PASSI_NUOVO)[number];

/** Data e soglia scritte per una scadenza appena creata */
export interface Completamento {
  scadeIl: string;
  soglia: string;
}

export function useNuovoSoggetto(tipoIniziale: TipoSoggetto | null, r: Riferimenti) {
  const toast = useToast();
  const [passo, setPasso] = useState<PassoNuovo>('tipo');
  const [tipo, setTipoStato] = useState<TipoSoggetto | null>(tipoIniziale);
  const [valori, setValori] = useState<ValoriSoggetto>(valoriIniziali());
  const [creato, setCreato] = useState<Soggetto | null>(null);
  const [scadenze, setScadenze] = useState<Scadenza[]>([]);
  const [completamenti, setCompletamenti] = useState<Record<string, Completamento>>({});
  const [inCorso, setInCorso] = useState(false);

  /** Cambiando tipo si riparte: categoria e dati sono del tipo */
  const setTipo = useCallback((t: TipoSoggetto) => {
    setTipoStato(t);
    setValori(valoriIniziali());
  }, []);

  const setCategoria = useCallback((c: string | null) => setValori(v => ({ ...v, categoria: c, campi: {} })), []);

  const crea = useCallback(async () => {
    if (!tipo) return;
    setInCorso(true);
    try {
      const corpo = corpoSoggetto(valori, tipo, campiDi(r.tutteLeCategorie, valori.categoria));
      const s = (await creaSoggetto({ ...corpo, tipo })).data;
      const l = await leggiScadenze({ soggetto: s.uuid, ordina: 'urgenza', righe: 128 });
      setCreato(s);
      setScadenze(l.righe);
      setCompletamenti(
        Object.fromEntries(l.righe.map(x => [x.uuid, { scadeIl: x.scadeIl ?? '', soglia: x.sogliaUso !== null ? String(x.sogliaUso) : '' }]))
      );
      setPasso('scadenze');
      toast?.({
        title: `${s.nome}: ${TIPI[s.tipo].femminile ? 'creata' : 'creato'}`,
        description: s.scadenzeCreate ? `${s.scadenzeCreate} ${s.scadenzeCreate === 1 ? 'scadenza creata' : 'scadenze create'} dai controlli della categoria.` : undefined,
      });
    } catch (e) {
      toast?.danger({ title: 'Soggetto non creato', description: (e as Error).message });
    } finally {
      setInCorso(false);
    }
  }, [r.tutteLeCategorie, tipo, toast, valori]);

  const completa = useCallback((uuid: string, c: Partial<Completamento>) => setCompletamenti(x => ({ ...x, [uuid]: { ...x[uuid], ...c } })), []);

  /** Salva le date e le soglie cambiate; true se tutto è andato */
  const salvaDate = useCallback(async () => {
    const cambiate = scadenze.filter(s => {
      const c = completamenti[s.uuid];
      return c && (c.scadeIl !== (s.scadeIl ?? '') || intero(c.soglia) !== s.sogliaUso);
    });
    if (!cambiate.length) return true;
    setInCorso(true);
    try {
      for (const s of cambiate) {
        const c = completamenti[s.uuid];
        const soglia = intero(c.soglia);
        await completaScadenza(s.uuid, { scadeIl: c.scadeIl || null, ...(s.contatore ? { sogliaUso: Number.isNaN(soglia) ? null : soglia } : {}) });
      }
      toast?.({ title: cambiate.length === 1 ? '1 scadenza completata' : `${cambiate.length} scadenze completate` });
      return true;
    } catch (e) {
      toast?.danger({ title: 'Date non salvate', description: (e as Error).message });
      return false;
    } finally {
      setInCorso(false);
    }
  }, [completamenti, scadenze, toast]);

  return { passo, setPasso, tipo, setTipo, setCategoria, valori, setValori, crea, creato, scadenze, completamenti, completa, salvaDate, inCorso };
}

export type StatoNuovoSoggetto = ReturnType<typeof useNuovoSoggetto>;
