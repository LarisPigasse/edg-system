// src/features/vigilo/hooks/useAvvio.ts
//
// Lo stato della procedura di avvio (passo 3.5): passo corrente, modelli
// scelti, proposta, scelte delle voci, predefiniti, invio. Le pagine dei passi
// leggono e chiamano solo da qui.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@edg/ui';

import { avvia as inviaAvvio, leggiProposta, leggiStatoAvvio } from '../api/avvio';
import type { EsitoAvvio, Proposta, StatoAvvio } from '../types/avvio';
import type { Predefiniti } from '../types/valori';
import { conteggi, riportaScelte, scegliCategorie, scegliControlli, selezioneIniziale, type Selezione } from '../utils/selezione';

export const PASSI = ['settori', 'voci', 'riepilogo', 'fatto'] as const;
export type Passo = (typeof PASSI)[number];

const VUOTA: Selezione = { categorie: new Set(), controlli: new Set(), sospesi: new Set() };

export function useAvvio() {
  const toast = useToast();
  const [passo, setPasso] = useState<Passo>('settori');
  const [stato, setStato] = useState<StatoAvvio | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [modelli, setModelli] = useState<ReadonlySet<string>>(new Set());
  const [proposta, setProposta] = useState<Proposta | null>(null);
  /** I modelli con cui è stata chiesta la proposta: se cambiano, si richiede */
  const [modelliProposta, setModelliProposta] = useState('');
  const [selezione, setSelezione] = useState<Selezione>(VUOTA);
  const [predefiniti, setPredefiniti] = useState<Predefiniti | null>(null);
  const [esito, setEsito] = useState<EsitoAvvio | null>(null);
  const [inCorso, setInCorso] = useState(false);

  // --- passo 1: modelli e stato ---------------------------------------------------
  useEffect(() => {
    leggiStatoAvvio()
      .then(s => {
        setStato(s);
        setPredefiniti(s.predefiniti);
        // Primo avvio: i preselezionati; dopo: quelli già applicati
        setModelli(new Set(s.modelli.filter(m => (s.avviatoIl ? m.applicato : m.preselezionato)).map(m => m.chiave)));
      })
      .catch((e: Error) => setErrore(e.message));
  }, []);

  const primoAvvio = !stato?.avviatoIl;
  const chiaviModelli = useMemo(
    () => (stato?.modelli ?? []).filter(m => modelli.has(m.chiave)).map(m => m.chiave),
    [stato, modelli]
  );

  const commutaModello = useCallback((chiave: string) => {
    setModelli(prima => {
      const nuovo = new Set(prima);
      if (nuovo.has(chiave)) nuovo.delete(chiave);
      else nuovo.add(chiave);
      return nuovo;
    });
  }, []);

  // --- passo 2: proposta e scelte -----------------------------------------------
  const vaiAlleVoci = useCallback(async () => {
    const firma = chiaviModelli.join(',');
    if (proposta && firma === modelliProposta) {
      setPasso('voci');
      return;
    }
    setInCorso(true);
    try {
      const p = await leggiProposta(chiaviModelli);
      // Settori cambiati dopo aver già scelto: le scelte fatte restano
      setSelezione(proposta ? riportaScelte(proposta, selezione, p) : selezioneIniziale(p));
      setProposta(p);
      setModelliProposta(firma);
      setPasso('voci');
    } catch (e) {
      toast?.danger({ title: 'Impossibile preparare la proposta', description: (e as Error).message });
    } finally {
      setInCorso(false);
    }
  }, [chiaviModelli, modelliProposta, proposta, selezione, toast]);

  const categorie = useCallback(
    (chiavi: string[], dentro: boolean) => proposta && setSelezione(s => scegliCategorie(proposta, s, chiavi, dentro)),
    [proposta]
  );
  const controlli = useCallback(
    (chiavi: string[], dentro: boolean) => proposta && setSelezione(s => scegliControlli(proposta, s, chiavi, dentro)),
    [proposta]
  );
  const perTipo = useMemo(() => (proposta ? conteggi(proposta, selezione) : []), [proposta, selezione]);

  // --- passi 3-4: invio ----------------------------------------------------------
  const invia = useCallback(
    async (daZero = false) => {
      setInCorso(true);
      try {
        const r = await inviaAvvio(
          daZero
            ? { modelli: [], categorie: [], controlli: [] }
            : {
                modelli: chiaviModelli,
                categorie: [...selezione.categorie],
                controlli: [...selezione.controlli],
                ...(predefiniti ? { predefiniti } : {}),
              }
        );
        setEsito(r.data);
        setPasso('fatto');
      } catch (e) {
        toast?.danger({ title: 'Avvio non riuscito', description: (e as Error).message });
      } finally {
        setInCorso(false);
      }
    },
    [chiaviModelli, predefiniti, selezione, toast]
  );

  return {
    passo,
    setPasso,
    stato,
    errore,
    primoAvvio,
    modelli,
    chiaviModelli,
    commutaModello,
    vaiAlleVoci,
    proposta,
    selezione,
    categorie,
    controlli,
    perTipo,
    predefiniti,
    setPredefiniti,
    invia,
    esito,
    inCorso,
  };
}

export type StatoProcedura = ReturnType<typeof useAvvio>;
