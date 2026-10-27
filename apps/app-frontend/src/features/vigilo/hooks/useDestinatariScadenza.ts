// src/features/vigilo/hooks/useDestinatariScadenza.ts
//
// Chi riceve gli avvisi di una scadenza (B8d-3): l'anteprima con i nomi e la
// modifica (destinatari propri, o null = come il controllo), con il toast.
// Si rilegge a ogni apertura del pannello e dopo ogni salvataggio.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@edg/ui';

import { cambiaDestinatariScadenza, leggiAnteprimaDestinatari } from '../api/destinatari';
import type { AnteprimaDestinatari, Destinatario } from '../types/destinatari';
import { fraseDestinatari } from '../utils/destinatari';

export function useDestinatariScadenza(uuid: string | null, aperto: boolean) {
  const toast = useToast();
  const [anteprima, setAnteprima] = useState<AnteprimaDestinatari | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const turno = useRef(0);

  const ricarica = useCallback(async () => {
    if (!uuid) return;
    const mio = ++turno.current;
    try {
      const a = await leggiAnteprimaDestinatari(uuid);
      if (mio !== turno.current) return;
      setAnteprima(a);
      setErrore(null);
    } catch (e) {
      if (mio === turno.current) setErrore((e as Error).message);
    }
  }, [uuid]);

  useEffect(() => {
    if (!aperto) return;
    setAnteprima(null);
    void ricarica();
  }, [aperto, ricarica]);

  /** true se è andato a buon fine (l'editor si chiude solo allora) */
  const salva = async (destinatari: Destinatario[] | null): Promise<boolean> => {
    if (!uuid) return false;
    setInCorso(true);
    try {
      await cambiaDestinatariScadenza(uuid, destinatari);
      toast?.({
        title: 'Destinatari salvati',
        description: destinatari ? `Gli avvisi di questa scadenza vanno a: ${fraseDestinatari(destinatari)}.` : 'Gli avvisi di questa scadenza seguono di nuovo il controllo.',
      });
      await ricarica();
      return true;
    } catch (e) {
      toast?.danger({ title: 'Destinatari non salvati', description: (e as Error).message });
      return false;
    } finally {
      setInCorso(false);
    }
  };

  return { anteprima, errore, inCorso, salva };
}
