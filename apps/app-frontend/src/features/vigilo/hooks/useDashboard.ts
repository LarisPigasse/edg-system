// src/features/vigilo/hooks/useDashboard.ts
//
// Lo stato della vista "Da fare": ricerca e filtri, riquadro scelto,
// ordinamento, i dati della dashboard e l'elenco a pagine (32 righe,
// "Mostra altre"). Dati ed elenco seguono gli stessi filtri, così i numeri
// corrispondono a ciò che si vede.
// Esporta PDF: tutte le righe della vista scelta (non solo le pagine lette),
// con i filtri sotto il titolo; nella vista "Da fare" in fondo anche le
// scadenze senza data, che a video stanno nella scheda riassuntiva.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { exportTableToPdf, useToast } from '@edg/ui';

import { leggiDashboard } from '../api/dashboard';
import { leggiScadenze, leggiTutteScadenze } from '../api/scadenze';
import { useRitardato } from './useRitardato';
import type { Dashboard } from '../types/dashboard';
import type { FiltriScadenze, RiferimentoSoggetto, Scadenza } from '../types/scadenze';
import { DEFINIZIONI, type Vista } from '../constants/viste';
import { NATURE_TESTO } from '../constants/nature';
import { TIPI } from '../constants/tipiSoggetto';
import { colonnePdf } from '../utils/pdfScadenze';

export type Ordina = 'urgenza' | 'soggetto';
const RIGHE = 32;
/** Righe massime del PDF (come la pagina Scadenze) */
const MASSIMO_PDF = 1024;

export function useDashboard() {
  const [testo, setTesto] = useState('');
  const [filtri, setFiltri] = useState<Omit<FiltriScadenze, 'testo'>>({});
  const [vista, setVista] = useState<Vista>('da-fare');
  const [ordina, setOrdina] = useState<Ordina>('urgenza');

  const [dati, setDati] = useState<Dashboard | null>(null);
  const [righe, setRighe] = useState<Scadenza[]>([]);
  const [totale, setTotale] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [altre, setAltre] = useState(false);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const [esporto, setEsporto] = useState(false);
  const toast = useToast();

  const testoRitardato = useRitardato(testo.trim());
  const completi = useMemo<FiltriScadenze>(() => ({ ...filtri, testo: testoRitardato || undefined }), [filtri, testoRitardato]);
  /** Solo l'ultima richiesta conta: risposte lente di filtri vecchi si scartano */
  const turno = useRef(0);

  /** La richiesta della vista scelta, senza le pagine (l'elenco la sfoglia, il PDF la legge tutta) */
  const base = useMemo(() => ({ ...completi, ...DEFINIZIONI[vista].richiesta, ordina }), [completi, vista, ordina]);
  const richiesta = useCallback((p: number) => ({ ...base, pagina: p, righe: RIGHE }), [base]);

  const carica = useCallback(async () => {
    const mio = ++turno.current;
    setCaricamento(true);
    try {
      const d = await leggiDashboard(completi);
      const l = await leggiScadenze(richiesta(1));
      if (mio !== turno.current) return;
      setDati(d);
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
  }, [completi, richiesta]);

  useEffect(() => {
    void carica();
  }, [carica]);

  const mostraAltre = useCallback(async () => {
    const mio = turno.current;
    setCaricamento(true);
    try {
      const l = await leggiScadenze(richiesta(pagina + 1));
      if (mio !== turno.current) return;
      setRighe(prima => [...prima, ...l.righe]);
      setAltre(l.altre);
      setPagina(p => p + 1);
    } catch (e) {
      setErrore((e as Error).message);
    } finally {
      setCaricamento(false);
    }
  }, [richiesta, pagina]);

  /** Clic su un riquadro: lo sceglie; un secondo clic torna a "Da fare" */
  const scegliVista = useCallback((v: Vista) => setVista(attuale => (attuale === v ? 'da-fare' : v)), []);

  /** Il PDF della vista scelta con i filtri scritti sotto il titolo; i nomi delle sedi arrivano da chi lo chiede */
  const esportaPdf = useCallback(
    async (sedi: RiferimentoSoggetto[]) => {
      setEsporto(true);
      try {
        const elenco = await leggiTutteScadenze(base, MASSIMO_PDF);
        let troncate = elenco.troncate;
        const tutte = [...elenco.righe];
        // nella vista di partenza anche le senza data, in fondo
        if (vista === 'da-fare' && !troncate) {
          const senzaData = await leggiTutteScadenze({ ...base, ...DEFINIZIONI['da-completare'].richiesta }, MASSIMO_PDF - tutte.length);
          tutte.push(...senzaData.righe);
          troncate = senzaData.troncate;
        }
        const definizione = DEFINIZIONI[vista];
        exportTableToPdf({
          filename: vista === 'da-fare' ? 'da-fare' : `da-fare-${vista}`,
          title: vista === 'da-fare' ? 'Da fare' : `Da fare · ${definizione.etichetta}`,
          subtitle: [
            filtri.tipo && TIPI[filtri.tipo].plurale,
            filtri.natura && NATURE_TESTO[filtri.natura],
            filtri.sede && sedi.find(s => s.uuid === filtri.sede)?.nome,
            testoRitardato && `"${testoRitardato}"`,
            `per ${ordina}`,
            `${tutte.length} ${tutte.length === 1 ? 'riga' : 'righe'}`,
          ]
            .filter(Boolean)
            .join(' · '),
          columns: colonnePdf(false),
          data: tutte,
        });
        if (troncate) toast?.({ title: 'PDF parziale', description: `Ci sono più di ${MASSIMO_PDF} scadenze: restringi i filtri per averle tutte.` });
      } catch (e) {
        toast?.danger({ title: 'PDF non creato', description: (e as Error).message });
      } finally {
        setEsporto(false);
      }
    },
    [base, vista, filtri, testoRitardato, ordina, toast]
  );

  const filtriAttivi = !!(testo.trim() || filtri.tipo || filtri.natura || filtri.sede);
  const azzeraFiltri = useCallback(() => {
    setTesto('');
    setFiltri({});
  }, []);

  return {
    testo,
    setTesto,
    filtri,
    setFiltri,
    filtriAttivi,
    azzeraFiltri,
    vista,
    scegliVista,
    ordina,
    setOrdina,
    dati,
    righe,
    totale,
    altre,
    mostraAltre,
    caricamento,
    errore,
    ricarica: carica,
    esportaPdf,
    esporto,
  };
}

export type StatoDashboard = ReturnType<typeof useDashboard>;
