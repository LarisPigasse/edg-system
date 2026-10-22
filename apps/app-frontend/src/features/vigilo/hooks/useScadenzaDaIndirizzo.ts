// src/features/vigilo/hooks/useScadenzaDaIndirizzo.ts
//
// Apre il pannello di una scadenza arrivando con ?scadenza=<uuid> (dalla
// campanella, ADR091), poi toglie il parametro: ricaricare la pagina o
// tornare indietro non riapre il pannello.
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useScadenzaDaIndirizzo(apri: (uuid: string) => void): void {
  const [parametri, setParametri] = useSearchParams();
  const uuid = parametri.get('scadenza');
  useEffect(() => {
    if (!uuid) return;
    apri(uuid);
    setParametri(
      p => {
        const q = new URLSearchParams(p);
        q.delete('scadenza');
        return q;
      },
      { replace: true }
    );
  }, [uuid, apri, setParametri]);
}
