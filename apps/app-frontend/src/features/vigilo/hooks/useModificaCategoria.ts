// src/features/vigilo/hooks/useModificaCategoria.ts
//
// Il pannello di una categoria (2026-11-19, passo 4): modifica (si salvano
// solo i campi cambiati) o nuova. Errori, "cosa cambia" per i soggetti che ci
// sono (calcolato qui: pochi effetti e chiari), salvataggio con il toast.
// Se il servizio rifiuta (es. un contatore che serve a dei controlli), il
// pannello resta aperto con il motivo.
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@edg/ui';

import { creaCategoria, modificaCategoria } from '../api/configurazione';
import type { Categoria } from '../types/configurazione';
import type { TipoSoggetto } from '../types/valori';
import { datiCreazione, differenze, effetti, erroriModulo, moduloDa, moduloNuovo, type ModuloCategoria } from '../utils/moduloCategoria';

export type SchedaCategoria = { modo: 'modifica'; categoria: Categoria } | { modo: 'nuova'; tipo: TipoSoggetto };

export const tipoDellaSchedaCategoria = (s: SchedaCategoria): TipoSoggetto => (s.modo === 'nuova' ? s.tipo : s.categoria.tipoSoggetto);

export function useModificaCategoria(scheda: SchedaCategoria | null, aperto: boolean, onSalvato: () => void) {
  const [modulo, setModulo] = useState<ModuloCategoria | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!aperto || !scheda) return;
    setModulo(scheda.modo === 'modifica' ? moduloDa(scheda.categoria) : moduloNuovo());
    setErrore(null);
  }, [aperto, scheda]);

  const nuova = scheda?.modo === 'nuova';
  const errori = useMemo(() => (modulo ? erroriModulo(modulo) : {}), [modulo]);
  const dati = useMemo(() => {
    if (!scheda || !modulo) return {};
    return scheda.modo === 'modifica' ? differenze(scheda.categoria, modulo) : datiCreazione(modulo, scheda.tipo);
  }, [scheda, modulo]);
  const cambiato = nuova || Object.keys(dati).length > 0;
  const valido = Object.keys(errori).length === 0;
  const righe = useMemo(() => (scheda?.modo === 'modifica' && modulo ? effetti(scheda.categoria, modulo) : []), [scheda, modulo]);

  const cambia = (m: Partial<ModuloCategoria>) => {
    setModulo(x => (x ? { ...x, ...m } : x));
    setErrore(null);
  };

  /** Salva o crea; vero se è riuscito */
  const salva = async (): Promise<boolean> => {
    if (!scheda || !cambiato || !valido) return false;
    setSalvando(true);
    try {
      const c = scheda.modo === 'modifica' ? await modificaCategoria(scheda.categoria.uuid, dati) : await creaCategoria(dati);
      toast?.({ title: `${c.nome}: ${scheda.modo === 'modifica' ? 'modificata' : 'creata'}` });
      onSalvato();
      return true;
    } catch (e) {
      setErrore((e as Error).message);
      return false;
    } finally {
      setSalvando(false);
    }
  };

  return { modulo, cambia, errori, dati, nuova, cambiato, valido, righe, errore, salva, salvando };
}
