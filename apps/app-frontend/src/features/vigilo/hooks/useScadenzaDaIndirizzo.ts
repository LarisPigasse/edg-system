// src/features/vigilo/hooks/useScadenzaDaIndirizzo.ts
//
// Apre il pannello di una scadenza arrivando con ?scadenza=<uuid> (dalla
// campanella, ADR091), poi toglie il parametro: ricaricare la pagina o
// tornare indietro non riapre il pannello. Con &azione=<azione> il pannello
// parte da quell'azione (es. un guasto "già riparato" apre Registra, B10a).
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AZIONI, type Azione } from '../constants/azioni';

const azioneValida = (a: string | null): Azione | null => (a && a in AZIONI ? (a as Azione) : null);

export function useScadenzaDaIndirizzo(apri: (uuid: string, azione: Azione | null) => void): void {
  const [parametri, setParametri] = useSearchParams();
  const uuid = parametri.get('scadenza');
  const azione = azioneValida(parametri.get('azione'));
  useEffect(() => {
    if (!uuid) return;
    apri(uuid, azione);
    setParametri(
      p => {
        const q = new URLSearchParams(p);
        q.delete('scadenza');
        q.delete('azione');
        return q;
      },
      { replace: true }
    );
  }, [uuid, azione, apri, setParametri]);
}
