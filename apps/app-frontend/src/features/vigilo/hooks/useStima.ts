// src/features/vigilo/hooks/useStima.ts
//
// La stima di un servizio mentre si scrive (2026-11-17, fase 2): il modulo,
// i mezzi e le persone da scegliere, i limiti del servizio e il calcolo,
// chiesto al servizio 256 ms dopo l'ultima modifica (una sola regola di
// calcolo, quella del servizio). Le risposte arrivate tardi si scartano.
// Vive nella pagina, non nella scheda: la stima scritta resta cambiando
// scheda, e "Duplica come nuova" la carica (fase 3). Salva la stima
// (il servizio la ricalcola dai dati).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@edg/ui';

import { leggiMezziDelTipo, leggiPersone } from '../api/soggetti';
import { calcolaStima, leggiParametriStima, salvaStima } from '../api/stima';
import type { RiferimentoSoggetto } from '../types/scadenze';
import type { CalcoloStima, ParametriStima } from '../types/stima';
import { MODULO_VUOTO, richiestaDa, type ModuloStima } from '../utils/moduloStima';

/** Attesa dopo l'ultima modifica prima di ricalcolare */
const ATTESA_MS = 256;

export function useStima() {
  const [modulo, setModulo] = useState<ModuloStima>(MODULO_VUOTO);
  const [parametri, setParametri] = useState<ParametriStima | null>(null);
  const [mezzi, setMezzi] = useState<RiferimentoSoggetto[]>([]);
  const [persone, setPersone] = useState<RiferimentoSoggetto[]>([]);
  const [calcolo, setCalcolo] = useState<CalcoloStima | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const ultima = useRef(0);
  const [salvando, setSalvando] = useState(false);
  const toast = useToast();

  useEffect(() => {
    void Promise.all([
      leggiParametriStima(),
      Promise.all((['veicolo', 'macchina', 'attrezzatura'] as const).map(t => leggiMezziDelTipo(t).catch(() => []))),
      leggiPersone().catch(() => []),
    ])
      .then(([p, gruppi, pp]) => {
        setParametri(p);
        setMezzi(gruppi.flat());
        setPersone(pp);
      })
      .catch(e => setErrore((e as Error).message));
  }, []);

  const { richiesta, errori } = useMemo(
    () => (parametri ? richiestaDa(modulo, parametri.limiti) : { richiesta: null, errori: {} }),
    [modulo, parametri]
  );
  const chiave = JSON.stringify(richiesta);

  useEffect(() => {
    if (!richiesta) {
      setCalcolo(null);
      return;
    }
    const numero = ++ultima.current;
    const t = setTimeout(() => {
      setInCorso(true);
      calcolaStima(richiesta)
        .then(c => {
          if (numero !== ultima.current) return;
          setCalcolo(c);
          setErrore(null);
        })
        .catch(e => numero === ultima.current && setErrore((e as Error).message))
        .finally(() => numero === ultima.current && setInCorso(false));
    }, ATTESA_MS);
    return () => clearTimeout(t);
    // la richiesta cambia solo quando cambia il suo contenuto (chiave)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chiave]);

  const cambia = (m: Partial<ModuloStima>) => setModulo(x => ({ ...x, ...m }));
  const azzera = () => setModulo(MODULO_VUOTO);
  /** Un modulo già pronto (es. una stima salvata da duplicare) */
  const carica = (m: ModuloStima) => setModulo(m);

  /** Salva la stima com'è; vero se è riuscito */
  const salva = async (): Promise<boolean> => {
    if (!richiesta) return false;
    setSalvando(true);
    try {
      const s = await salvaStima({ ...richiesta, descrizione: modulo.descrizione.trim() });
      toast?.({ title: 'Stima salvata', description: `${s.descrizione}: la trovi in Stime salvate.` });
      return true;
    } catch (e) {
      toast?.danger({ title: 'Stima non salvata', description: (e as Error).message });
      return false;
    } finally {
      setSalvando(false);
    }
  };

  return { modulo, cambia, azzera, carica, salva, salvando, parametri, mezzi, persone, errori, richiesta, calcolo, errore, inCorso };
}

export type StatoStima = ReturnType<typeof useStima>;
