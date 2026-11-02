// src/features/vigilo/hooks/useAggiornamenti.ts
//
// Gli aggiornamenti della libreria per chi ha vigilo.config (B10b): senza
// permesso la lettura fallisce in silenzio e il riquadro non compare. Dopo una
// decisione si rilegge l'elenco e la configurazione (onCambiata); decidi
// restituisce true se è andata, così il pannello va avanti solo allora.
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@edg/ui';

import { decidi as decidiApi, leggiAggiornamenti, segnaVisto } from '../api/aggiornamenti';
import type { Decisione, ElencoAggiornamenti, EsitoDecisioneVoce, VoceAggiornamento } from '../types/aggiornamenti';

function messaggio(v: VoceAggiornamento, d: Decisione, e: EsitoDecisioneVoce): { title: string; description?: string } {
  if (v.tipo === 'ritiro') {
    if (d.ritiro === 'tieni') return { title: 'Voce tenuta', description: `${v.nome} resta com’è.` };
    const chiuse = e.scadenzeChiuse ? ` ${e.scadenzeChiuse === 1 ? 'Chiusa 1 scadenza aperta' : `Chiuse ${e.scadenzeChiuse} scadenze aperte`}.` : '';
    return { title: 'Voce disattivata', description: `${v.nome}.${chiuse}` };
  }
  if (e.esito === 'rifiutato') return { title: 'Tenuti i tuoi valori', description: v.nome };
  const altro = e.scadenzeCreate ? ` ${e.scadenzeCreate === 1 ? 'Creata 1 scadenza' : `Create ${e.scadenzeCreate} scadenze`}.` : '';
  return { title: e.esito === 'parziale' ? 'Aggiornamento applicato in parte' : 'Aggiornamento applicato', description: `${v.nome}.${altro}` };
}

export function useAggiornamenti(onCambiata?: () => void) {
  const toast = useToast();
  const [elenco, setElenco] = useState<ElencoAggiornamenti | null>(null);
  const [inCorso, setInCorso] = useState(false);

  const ricarica = useCallback(async () => {
    try {
      setElenco(await leggiAggiornamenti());
    } catch {
      setElenco(null);
    }
  }, []);

  useEffect(() => {
    void ricarica();
  }, [ricarica]);

  /** Prima apertura: si annota senza disturbare (se non riesce, pazienza) */
  const visto = (v: VoceAggiornamento) => {
    if (v.vistoIl) return;
    segnaVisto(v.entita, v.uuid)
      .then(r => setElenco(e => e && { ...e, voci: e.voci.map(x => (x.uuid === v.uuid ? { ...x, vistoIl: r.data.vistoIl } : x)) }))
      .catch(() => undefined);
  };

  const decidi = async (v: VoceAggiornamento, d: Decisione): Promise<boolean> => {
    setInCorso(true);
    try {
      const e = (await decidiApi(v.entita, v.uuid, d)).data;
      toast?.(messaggio(v, d, e));
      await ricarica();
      onCambiata?.();
      return true;
    } catch (err) {
      toast?.danger({ title: 'Decisione non salvata', description: (err as Error).message });
      await ricarica(); // la libreria potrebbe essere cambiata nel frattempo
      return false;
    } finally {
      setInCorso(false);
    }
  };

  return { elenco, inCorso, ricarica, visto, decidi };
}
