// src/features/vigilo/hooks/usePersoneManodopera.ts
//
// Per le righe di manodopera del modulo Registra (passo 8): le persone del
// tenant (non archiviate) e, a chi ha vigilo.costi, i costi orari per la stima
// (della persona, altrimenti il predefinito). Si leggono solo se servono; se
// non si riesce, resta "Dipendente" e la stima senza costo.
import { useEffect, useState } from 'react';

import { leggiInterventi } from '../api/impostazioni';
import { leggiSoggetti } from '../api/soggetti';

export interface PersonaManodopera {
  uuid: string;
  nome: string;
  costoOrario: number | null;
}

/** Persone lette per volta: bastano per un tenant con una squadra interna */
const RIGHE = 128;

export function usePersoneManodopera(attivo: boolean, costi: boolean) {
  const [persone, setPersone] = useState<PersonaManodopera[]>([]);
  const [costoPredefinito, setCostoPredefinito] = useState<number | null>(null);

  useEffect(() => {
    if (!attivo) return;
    let valido = true;
    leggiSoggetti({ tipo: 'persona', stato: 'attivi', righe: RIGHE, pagina: 1, ordina: 'nome' })
      .then(l =>
        valido &&
        setPersone(
          l.righe
            .map(p => ({ uuid: p.uuid, nome: p.nome, costoOrario: p.costoOrario ?? null }))
            .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
        )
      )
      .catch(() => valido && setPersone([]));
    if (costi)
      leggiInterventi()
        .then(s => valido && setCostoPredefinito(s.costoOrario ?? null))
        .catch(() => valido && setCostoPredefinito(null));
    return () => {
      valido = false;
    };
  }, [attivo, costi]);

  return { persone, costoPredefinito };
}
