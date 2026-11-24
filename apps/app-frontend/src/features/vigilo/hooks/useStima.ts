// src/features/vigilo/hooks/useStima.ts
//
// La stima di un servizio mentre si scrive (2026-11-17, fase 2): il modulo,
// i mezzi e le persone da scegliere, i limiti del servizio e il calcolo,
// chiesto al servizio 256 ms dopo l'ultima modifica (una sola regola di
// calcolo, quella del servizio). Le risposte arrivate tardi si scartano.
// Vive nella pagina, non nella scheda: la stima scritta resta cambiando
// scheda, e "Duplica come nuova" la carica (fase 3). Salva la stima
// (il servizio la ricalcola dai dati). I costi del mezzo e orario arrivano
// proposti da Vigilo (useProposteStima) e si possono correggere.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@edg/ui';

import { leggiMezziDelTipo, leggiPersone } from '../api/soggetti';
import { calcolaStima, leggiParametriStima, salvaStima } from '../api/stima';
import type { RiferimentoSoggetto } from '../types/scadenze';
import type { CalcoloStima, ParametriStima } from '../types/stima';
import { MODULO_VUOTO, conProposte, richiestaDa, type ModuloStima } from '../utils/moduloStima';
import { testoNumero } from '../utils/numeri';
import { useProposteStima } from './useProposteStima';

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

  const cambia = (m: Partial<ModuloStima>) => setModulo(x => ({ ...x, ...m }));
  // i costi proposti da Vigilo (mezzo, persona o costo medio), scritti nei campi e modificabili
  const proposte = useProposteStima(modulo, parametri, cambia);

  const { richiesta, errori } = useMemo(() => {
    if (!parametri) return { richiesta: null, errori: {} };
    const r = richiestaDa(modulo, parametri.limiti);
    // i costi lasciati come proposti vanno al servizio come "da Vigilo", non come scritti a mano
    return { ...r, richiesta: r.richiesta ? conProposte(r.richiesta, proposte) : null };
  }, [modulo, parametri, proposte]);
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

  /** Da capo; il costo orario riparte dal costo medio proposto */
  const azzera = () => {
    const media = proposte.costoOrario?.fonte === 'media' ? proposte.costoOrario.valore : parametri?.generali.costoOrarioConducente;
    setModulo({ ...MODULO_VUOTO, costoOrario: media != null ? testoNumero(media, 2) : '' });
  };
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

  return { modulo, cambia, azzera, carica, salva, salvando, parametri, mezzi, persone, proposte, errori, richiesta, calcolo, errore, inCorso };
}

export type StatoStima = ReturnType<typeof useStima>;
