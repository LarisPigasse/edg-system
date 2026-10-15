// src/features/vigilo/hooks/useSoggetto.ts
//
// Un soggetto aperto nella sua scheda: i dati, le scadenze aperte (per
// urgenza), i campi aggiuntivi della sua categoria e il cambio di stato
// (attivo, sospeso, archiviato) con il toast che dice che cosa è cambiato e,
// dopo Sospendi o Archivia, offre "Annulla" (torna allo stato di prima, senza
// altre conferme: il ripristino riapre anche le scadenze chiuse).
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@edg/ui';

import { leggiCategorie } from '../api/configurazione';
import { creaScadenza, leggiScadenze } from '../api/scadenze';
import { cambiaStatoSoggetto, leggiSoggetto, modificaSoggetto } from '../api/soggetti';
import { etichettaStato } from '../constants/statiSoggetto';
import { TIPI } from '../constants/tipiSoggetto';
import type { CampoAggiuntivo } from '../types/configurazione';
import type { Scadenza } from '../types/scadenze';
import type { DatiSoggetto, EsitoSalvataggio, EsitoStato, Soggetto, StatoSoggetto } from '../types/soggetti';

/** "3 scadenze chiuse, 1 assegnazione terminata" */
function sintesiEsito(e: EsitoStato): string | undefined {
  const parti = [
    e.scadenzeChiuse && `${e.scadenzeChiuse} ${e.scadenzeChiuse === 1 ? 'scadenza chiusa' : 'scadenze chiuse'}`,
    e.scadenzeRiaperte && (e.scadenzeRiaperte === 1 ? '1 scadenza riaperta con la sua data' : `${e.scadenzeRiaperte} scadenze riaperte con le loro date`),
    e.scadenzeCreate && `${e.scadenzeCreate} ${e.scadenzeCreate === 1 ? 'scadenza nuova' : 'scadenze nuove'}`,
    e.assegnazioniTerminate && `${e.assegnazioniTerminate} ${e.assegnazioniTerminate === 1 ? 'assegnazione terminata' : 'assegnazioni terminate'}`,
  ].filter(Boolean);
  return parti.length ? `${parti.join(', ')}.` : undefined;
}

/** "2 scadenze nuove, 1 completata dai dati" */
function sintesiModifica(e: EsitoSalvataggio): string | undefined {
  const parti = [
    e.scadenzeCreate && `${e.scadenzeCreate} ${e.scadenzeCreate === 1 ? 'scadenza nuova' : 'scadenze nuove'} dai controlli della categoria`,
    e.scadenzeCompletate && `${e.scadenzeCompletate} ${e.scadenzeCompletate === 1 ? 'scadenza completata' : 'scadenze completate'} dai dati`,
  ].filter(Boolean);
  return parti.length ? `${parti.join(', ')}.` : undefined;
}

export function useSoggetto(uuid: string) {
  const toast = useToast();
  const [soggetto, setSoggetto] = useState<Soggetto | null>(null);
  const [scadenze, setScadenze] = useState<Scadenza[]>([]);
  const [campi, setCampi] = useState<CampoAggiuntivo[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const turno = useRef(0);

  const ricarica = useCallback(async () => {
    const mio = ++turno.current;
    setCaricamento(true);
    try {
      const [s, l] = await Promise.all([leggiSoggetto(uuid), leggiScadenze({ soggetto: uuid, ordina: 'urgenza', righe: 128 })]);
      if (mio !== turno.current) return;
      setSoggetto(s);
      setScadenze(l.righe);
      setErrore(null);
    } catch (e) {
      if (mio === turno.current) setErrore((e as Error).message);
    } finally {
      if (mio === turno.current) setCaricamento(false);
    }
  }, [uuid]);

  useEffect(() => {
    void ricarica();
  }, [ricarica]);

  // i campi aggiuntivi vengono dalla categoria
  const categoria = soggetto?.categoria?.uuid ?? null;
  useEffect(() => {
    if (!categoria) {
      setCampi([]);
      return;
    }
    leggiCategorie()
      .then(c => setCampi([...(c.find(x => x.uuid === categoria)?.campi ?? [])].sort((a, b) => a.ordine - b.ordine)))
      .catch(() => setCampi([]));
  }, [categoria]);

  const cambiaStato = useCallback(
    async function cambia(stato: StatoSoggetto, annullabile = true): Promise<boolean> {
      if (!soggetto) return false;
      const prima = soggetto.stato;
      setInCorso(true);
      try {
        const r = await cambiaStatoSoggetto(soggetto.uuid, stato);
        // si annulla solo ciò che allontana dall'attivo (sospendere, archiviare)
        const annulla = annullabile && stato !== 'in-servizio' ? { label: 'Annulla', onClick: () => void cambia(prima, false) } : undefined;
        toast?.({ title: `${soggetto.nome}: ${etichettaStato(stato, soggetto.tipo).toLowerCase()}`, description: sintesiEsito(r.data), action: annulla });
        await ricarica();
        return true;
      } catch (e) {
        toast?.danger({ title: 'Stato non cambiato', description: (e as Error).message });
        return false;
      } finally {
        setInCorso(false);
      }
    },
    [ricarica, soggetto, toast]
  );

  const modifica = useCallback(
    async (dati: Omit<DatiSoggetto, 'tipo'>) => {
      if (!soggetto) return false;
      setInCorso(true);
      try {
        const r = await modificaSoggetto(soggetto.uuid, dati);
        toast?.({ title: `${r.data.nome}: ${TIPI[soggetto.tipo].femminile ? 'modificata' : 'modificato'}`, description: sintesiModifica(r.data) });
        await ricarica();
        return true;
      } catch (e) {
        toast?.danger({ title: 'Modifiche non salvate', description: (e as Error).message });
        return false;
      } finally {
        setInCorso(false);
      }
    },
    [ricarica, soggetto, toast]
  );

  /** Una scadenza in più: un controllo non automatico o un promemoria */
  const aggiungiScadenza = useCallback(
    async (dati: { controllo: string | null; titolo?: string; scadeIl?: string; note?: string | null }) => {
      if (!soggetto) return false;
      setInCorso(true);
      try {
        const r = await creaScadenza({ ...dati, soggetto: soggetto.uuid });
        toast?.({ title: r.message ?? 'Scadenza creata', description: `${r.data.titolo}: ${r.data.testo}.` });
        await ricarica();
        return true;
      } catch (e) {
        toast?.danger({ title: 'Scadenza non creata', description: (e as Error).message });
        return false;
      } finally {
        setInCorso(false);
      }
    },
    [ricarica, soggetto, toast]
  );

  return { soggetto, scadenze, campi, caricamento, errore, inCorso, ricarica, cambiaStato, modifica, aggiungiScadenza };
}

export type StatoSoggettoAperto = ReturnType<typeof useSoggetto>;
