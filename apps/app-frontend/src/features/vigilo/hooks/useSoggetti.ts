// src/features/vigilo/hooks/useSoggetti.ts
//
// Lo stato dell'elenco dei soggetti: tipo scelto (la scheda), ricerca,
// filtri, ordinamento e pagine da 32 ("Mostra altri"). In più, letti una
// volta: i conteggi per tipo (da /dashboard), le categorie e le sedi per i
// filtri. Cambiando tipo il filtro di categoria si azzera: le categorie
// appartengono a un tipo.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { leggiCategorie } from '../api/configurazione';
import { leggiDashboard } from '../api/dashboard';
import { leggiSedi, leggiSoggetti } from '../api/soggetti';
import type { Categoria } from '../types/configurazione';
import type { Dashboard } from '../types/dashboard';
import type { RiferimentoSoggetto } from '../types/scadenze';
import type { FiltriSoggetti, OrdinaSoggetti, Soggetto } from '../types/soggetti';
import type { TipoSoggetto } from '../types/valori';
import { useRitardato } from './useRitardato';

const RIGHE = 32;
const FILTRI_INIZIALI: FiltriSoggetti = { stato: 'attivi' };

export function useSoggetti(tipoIniziale: TipoSoggetto | null) {
  const [tipo, setTipoStato] = useState<TipoSoggetto | null>(tipoIniziale);
  const [testo, setTesto] = useState('');
  const [filtri, setFiltri] = useState<FiltriSoggetti>(FILTRI_INIZIALI);
  const [ordina, setOrdina] = useState<OrdinaSoggetti>('urgenza');

  const [righe, setRighe] = useState<Soggetto[]>([]);
  const [totale, setTotale] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [altre, setAltre] = useState(false);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);

  const [conteggi, setConteggi] = useState<Dashboard['soggetti'] | null>(null);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [sedi, setSedi] = useState<RiferimentoSoggetto[]>([]);

  const testoRitardato = useRitardato(testo.trim());
  /** Solo l'ultima richiesta conta */
  const turno = useRef(0);

  const richiesta = useCallback(
    (p: number) => ({ ...filtri, tipo: tipo ?? undefined, testo: testoRitardato || undefined, ordina, pagina: p, righe: RIGHE }),
    [filtri, tipo, testoRitardato, ordina]
  );

  const carica = useCallback(async () => {
    const mio = ++turno.current;
    setCaricamento(true);
    try {
      const l = await leggiSoggetti(richiesta(1));
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
  }, [richiesta]);

  useEffect(() => {
    void carica();
  }, [carica]);

  const mostraAltri = useCallback(async () => {
    const mio = ++turno.current;
    setCaricamento(true);
    try {
      const l = await leggiSoggetti(richiesta(pagina + 1));
      if (mio !== turno.current) return;
      setRighe(r => [...r, ...l.righe]);
      setAltre(l.altre);
      setPagina(pagina + 1);
    } catch (e) {
      if (mio === turno.current) setErrore((e as Error).message);
    } finally {
      if (mio === turno.current) setCaricamento(false);
    }
  }, [pagina, richiesta]);

  // conteggi per tipo, categorie e sedi: una volta, e a ogni "ricarica"
  const caricaContorno = useCallback(() => {
    leggiDashboard({})
      .then(d => setConteggi(d.soggetti))
      .catch(() => setConteggi([]));
    leggiCategorie()
      .then(setCategorie)
      .catch(() => setCategorie([]));
    leggiSedi()
      .then(setSedi)
      .catch(() => setSedi([]));
  }, []);

  useEffect(caricaContorno, [caricaContorno]);

  const ricarica = useCallback(() => {
    caricaContorno();
    void carica();
  }, [carica, caricaContorno]);

  const setTipo = useCallback((t: TipoSoggetto | null) => {
    setTipoStato(t);
    setFiltri(f => ({ ...f, categoria: undefined }));
  }, []);

  /** Le categorie del tipo scelto (tutte, se "Tutti") */
  const categorieDelTipo = useMemo(() => categorie.filter(c => !tipo || c.tipoSoggetto === tipo), [categorie, tipo]);

  const filtriAttivi = !!testo.trim() || !!filtri.categoria || !!filtri.sede || filtri.stato !== 'attivi';
  const azzera = useCallback(() => {
    setTesto('');
    setFiltri(FILTRI_INIZIALI);
  }, []);

  return {
    tipo,
    setTipo,
    testo,
    setTesto,
    filtri,
    setFiltri,
    ordina,
    setOrdina,
    righe,
    totale,
    altre,
    mostraAltri,
    caricamento,
    errore,
    ricarica,
    conteggi,
    categorie: categorieDelTipo,
    sedi,
    filtriAttivi,
    azzera,
  };
}

export type StatoSoggetti = ReturnType<typeof useSoggetti>;
