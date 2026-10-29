// src/features/vigilo/hooks/useElencoScadenze.ts
//
// Lo stato dell'elenco delle scadenze: ricerca, filtri (stato, tipo, natura,
// controllo, sede), ordinamento e pagine da 32 ("Mostra altre"). Lo stato
// "chiuse" chiede le scadenze storiche, dalla più recente; "segnalate" le aperte
// con una segnalazione dell'addetto da confermare (B9c). In più, lette una
// volta, le scelte dei filtri (controlli e sedi) e l'esportazione in PDF di
// tutto ciò che i filtri trovano (fino a 1024 righe).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { exportTableToPdf, useToast } from '@edg/ui';

import { leggiControlli } from '../api/configurazione';
import { leggiScadenze, leggiTutteScadenze, type RichiestaScadenze } from '../api/scadenze';
import { leggiSedi } from '../api/soggetti';
import { FILTRI_STATO_SCADENZE } from '../constants/elencoScadenze';
import type { Controllo } from '../types/configurazione';
import type { FiltroStatoScadenze, OrdinaScadenze, RiferimentoSoggetto, Scadenza } from '../types/scadenze';
import type { NaturaEffettiva, TipoSoggetto } from '../types/valori';
import { colonnePdf } from '../utils/pdfScadenze';
import { useRitardato } from './useRitardato';

const RIGHE = 32;

export interface FiltriElenco {
  stato: FiltroStatoScadenze;
  tipo?: TipoSoggetto;
  natura?: NaturaEffettiva;
  controllo?: string;
  sede?: string;
}

const FILTRI_INIZIALI: FiltriElenco = { stato: 'aperte' };

export function useElencoScadenze(iniziali: Partial<FiltriElenco> = {}) {
  const toast = useToast();
  const [testo, setTesto] = useState('');
  const [filtri, setFiltri] = useState<FiltriElenco>({ ...FILTRI_INIZIALI, ...iniziali });
  const [ordina, setOrdina] = useState<OrdinaScadenze>('urgenza');

  const [righe, setRighe] = useState<Scadenza[]>([]);
  const [totale, setTotale] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [altre, setAltre] = useState(false);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const [esporto, setEsporto] = useState(false);

  const [controlli, setControlli] = useState<Controllo[]>([]);
  const [sedi, setSedi] = useState<RiferimentoSoggetto[]>([]);

  const testoRitardato = useRitardato(testo.trim());
  const turno = useRef(0);

  /** La richiesta al servizio, senza pagina */
  const base = useMemo<Omit<RichiestaScadenze, 'pagina' | 'righe'>>(() => {
    const { stato, ...resto } = filtri;
    const chiuse = stato === 'chiuse';
    const segnalate = stato === 'segnalate';
    return {
      ...resto,
      testo: testoRitardato || undefined,
      ...(chiuse ? { aperte: false, ordina: 'chiusaIl', verso: 'desc' } : { ordina }),
      ...(segnalate ? { segnalate: true } : {}),
      ...(stato !== 'aperte' && !chiuse && !segnalate ? { stati: stato } : {}),
    };
  }, [filtri, ordina, testoRitardato]);

  const carica = useCallback(async () => {
    const mio = ++turno.current;
    setCaricamento(true);
    try {
      const l = await leggiScadenze({ ...base, pagina: 1, righe: RIGHE });
      if (mio !== turno.current) return;
      setRighe(l.righe);
      setTotale(l.totale);
      setAltre(l.altre);
      setPagina(1);
      setErrore(null);
    } catch (e) {
      if (mio === turno.current) setErrore((e as Error).message);
    } finally {
      if (mio === turno.current) setCaricamento(false);
    }
  }, [base]);

  useEffect(() => {
    void carica();
  }, [carica]);

  const mostraAltre = useCallback(async () => {
    const mio = ++turno.current;
    setCaricamento(true);
    try {
      const l = await leggiScadenze({ ...base, pagina: pagina + 1, righe: RIGHE });
      if (mio !== turno.current) return;
      setRighe(r => [...r, ...l.righe]);
      setAltre(l.altre);
      setPagina(pagina + 1);
    } catch (e) {
      if (mio === turno.current) setErrore((e as Error).message);
    } finally {
      if (mio === turno.current) setCaricamento(false);
    }
  }, [base, pagina]);

  useEffect(() => {
    leggiControlli()
      .then(c => setControlli([...c].sort((a, b) => a.nome.localeCompare(b.nome, 'it'))))
      .catch(() => setControlli([]));
    leggiSedi()
      .then(setSedi)
      .catch(() => setSedi([]));
  }, []);

  const filtriAttivi = !!testo.trim() || filtri.stato !== 'aperte' || !!filtri.tipo || !!filtri.natura || !!filtri.controllo || !!filtri.sede;
  const azzera = useCallback(() => {
    setTesto('');
    setFiltri(FILTRI_INIZIALI);
  }, []);

  /** Il PDF di tutto ciò che i filtri trovano, con i filtri scritti sotto il titolo */
  const esportaPdf = useCallback(async () => {
    setEsporto(true);
    try {
      const { righe: tutte, troncate } = await leggiTutteScadenze(base);
      const controllo = controlli.find(c => c.uuid === filtri.controllo)?.nome;
      const sede = sedi.find(s => s.uuid === filtri.sede)?.nome;
      const stato = FILTRI_STATO_SCADENZE.find(f => f.value === filtri.stato)?.label;
      exportTableToPdf({
        filename: 'scadenze',
        title: 'Scadenze',
        subtitle: [stato, controllo, sede, testoRitardato && `"${testoRitardato}"`, `${tutte.length} righe`].filter(Boolean).join(' · '),
        columns: colonnePdf(filtri.stato === 'chiuse'),
        data: tutte,
      });
      if (troncate) toast?.({ title: 'PDF parziale', description: 'Ci sono più di 1024 scadenze: restringi i filtri per averle tutte.' });
    } catch (e) {
      toast?.danger({ title: 'PDF non creato', description: (e as Error).message });
    } finally {
      setEsporto(false);
    }
  }, [base, controlli, filtri, sedi, testoRitardato, toast]);

  return {
    testo,
    setTesto,
    filtri,
    setFiltri,
    ordina,
    setOrdina,
    righe,
    totale,
    altre,
    mostraAltre,
    caricamento,
    errore,
    ricarica: carica,
    controlli,
    sedi,
    filtriAttivi,
    azzera,
    esportaPdf,
    esporto,
  };
}

export type StatoElencoScadenze = ReturnType<typeof useElencoScadenze>;
