// src/features/vigilo/hooks/useModificaControllo.ts
//
// Il pannello di un controllo (2026-11-19), in tre modi:
//   modifica   il modulo dal controllo; si salvano solo i campi cambiati
//   nuovo      il punto di partenza (ogni anno, preavvisi dell'azienda, automatico)
//   duplica    tutto come l'originale, "(copia)" nel nome, anche i destinatari
// In ogni modo: errori, anteprima di "cosa cambia" (o di quante scadenze
// nasceranno) chiesta al servizio 512 ms dopo l'ultima modifica, frasi in
// parole dall'anteprima, salvataggio con il toast dell'esito.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@edg/ui';

import { anteprimaControllo, anteprimaCreazione, creaControllo, modificaControllo, type AnteprimaControllo } from '../api/configurazione';
import type { Controllo } from '../types/configurazione';
import type { Predefiniti, TipoSoggetto } from '../types/valori';
import { datiCreazione, differenze, erroriModulo, moduloCopia, moduloDa, moduloNuovo, toccaLeScadenze, type ModuloControllo } from '../utils/moduloControllo';

/** Attesa dopo l'ultima modifica prima di chiedere l'anteprima */
const ATTESA_MS = 512;

/** Che cosa si apre nel pannello */
export type SchedaControllo =
  | { modo: 'modifica'; controllo: Controllo }
  | { modo: 'nuovo'; tipo: TipoSoggetto; predefiniti: Predefiniti | null }
  | { modo: 'duplica'; controllo: Controllo };

const quante = (n: number, una: string, tante: string) => `${n} ${n === 1 ? una : tante}`;

/** Il riassunto dell'esito, per il toast e per il riquadro "Cosa cambia" */
export function righeEsito(e: { scadenzeRicalcolate: number; scadenzeChiuse: number; scadenzeRiaperte: number; scadenzeCreate: number }): string[] {
  return [
    e.scadenzeRicalcolate ? `${quante(e.scadenzeRicalcolate, 'scadenza aperta cambia', 'scadenze aperte cambiano')} data o stato` : null,
    e.scadenzeChiuse ? `${quante(e.scadenzeChiuse, 'scadenza si chiude', 'scadenze si chiudono')} (soggetti fuori dalle categorie)` : null,
    e.scadenzeRiaperte ? `${quante(e.scadenzeRiaperte, 'scadenza si riapre', 'scadenze si riaprono')} con le sue date` : null,
    e.scadenzeCreate ? quante(e.scadenzeCreate, 'scadenza nuova', 'scadenze nuove') : null,
  ].filter((r): r is string => r !== null);
}

/** Il tipo di soggetto della scheda */
export const tipoDellaScheda = (s: SchedaControllo): TipoSoggetto => (s.modo === 'nuovo' ? s.tipo : s.controllo.tipoSoggetto);

export function useModificaControllo(scheda: SchedaControllo | null, aperto: boolean, onSalvato: () => void) {
  const [modulo, setModulo] = useState<ModuloControllo | null>(null);
  const [anteprima, setAnteprima] = useState<AnteprimaControllo | null>(null);
  const [leggoAnteprima, setLeggoAnteprima] = useState(false);
  /** Il servizio rifiuta (es. una cadenza a km con categorie senza contatore km) */
  const [erroreAnteprima, setErroreAnteprima] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const toast = useToast();
  const ultima = useRef(0);

  useEffect(() => {
    if (!aperto || !scheda) return;
    setModulo(scheda.modo === 'modifica' ? moduloDa(scheda.controllo) : scheda.modo === 'duplica' ? moduloCopia(scheda.controllo) : moduloNuovo(scheda.predefiniti));
    setAnteprima(null);
    setErroreAnteprima(null);
  }, [aperto, scheda]);

  const crea = scheda?.modo === 'nuovo' || scheda?.modo === 'duplica';
  const conUso = !!modulo?.cadenza.uso;
  const errori = useMemo(() => (modulo ? erroriModulo(modulo, conUso) : {}), [modulo, conUso]);
  const dati = useMemo(() => {
    if (!scheda || !modulo) return {};
    if (scheda.modo === 'modifica') return differenze(scheda.controllo, modulo);
    const d = datiCreazione(modulo, tipoDellaScheda(scheda));
    // la copia porta anche i destinatari degli avvisi dell'originale
    return scheda.modo === 'duplica' ? { ...d, destinatari: scheda.controllo.destinatari } : d;
  }, [scheda, modulo]);
  const cambiato = crea || Object.keys(dati).length > 0;
  const valido = Object.keys(errori).length === 0;
  // l'anteprima non ha bisogno del nome: parte anche finché manca (Crea resta bloccato)
  const validoPerAnteprima = Object.keys(errori).every(k => k === 'nome');
  const datiAnteprima = crea && !(dati as { nome?: string }).nome ? { ...dati, nome: 'Nuovo controllo' } : dati;
  const chiave = JSON.stringify(datiAnteprima);

  useEffect(() => {
    if (!scheda || !aperto || !validoPerAnteprima || (!crea && !toccaLeScadenze(dati))) {
      setAnteprima(null);
      setErroreAnteprima(null);
      return;
    }
    const numero = ++ultima.current;
    const t = setTimeout(() => {
      setLeggoAnteprima(true);
      const richiesta: Promise<AnteprimaControllo> =
        scheda.modo === 'modifica'
          ? anteprimaControllo(scheda.controllo.uuid, datiAnteprima)
          : anteprimaCreazione(datiAnteprima).then(a => ({ ...a, scadenzeChiuse: 0, scadenzeRiaperte: 0, scadenzeRicalcolate: 0, scadenzeAperte: 0 }));
      richiesta
        .then(a => {
          if (numero !== ultima.current) return;
          setAnteprima(a);
          setErroreAnteprima(null);
        })
        .catch(e => {
          if (numero !== ultima.current) return;
          setAnteprima(null);
          setErroreAnteprima((e as Error).message);
        })
        .finally(() => numero === ultima.current && setLeggoAnteprima(false));
    }, ATTESA_MS);
    return () => clearTimeout(t);
    // la richiesta cambia solo quando cambia il suo contenuto (chiave)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chiave, aperto, validoPerAnteprima]);

  const cambia = (m: Partial<ModuloControllo>) => setModulo(x => (x ? { ...x, ...m } : x));

  /** Salva (modifica: i soli campi cambiati) o crea; vero se è riuscito */
  const salva = async (): Promise<boolean> => {
    if (!scheda || !cambiato || !valido) return false;
    setSalvando(true);
    try {
      if (scheda.modo === 'modifica') {
        const esito = await modificaControllo(scheda.controllo.uuid, dati);
        const righe = righeEsito(esito);
        toast?.({ title: `${esito.nome}: modificato`, description: righe.length ? `${righe.join('; ')}.` : undefined });
      } else {
        const creato = await creaControllo(dati);
        toast?.({
          title: `${creato.nome}: creato`,
          description: creato.scadenzeCreate ? `${quante(creato.scadenzeCreate, 'scadenza nuova', 'scadenze nuove')}.` : 'Nessuna scadenza: si aggiungono dai soggetti.',
        });
      }
      onSalvato();
      return true;
    } catch (e) {
      toast?.danger({ title: scheda.modo === 'modifica' ? 'Modifiche non salvate' : 'Controllo non creato', description: (e as Error).message });
      return false;
    } finally {
      setSalvando(false);
    }
  };

  return { modulo, cambia, errori, dati, crea, cambiato, valido, anteprima, erroreAnteprima, leggoAnteprima, salva, salvando, conUso };
}
