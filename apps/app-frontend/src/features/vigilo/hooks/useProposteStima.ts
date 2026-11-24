// src/features/vigilo/hooks/useProposteStima.ts
//
// I costi che Vigilo propone nella nuova stima (2026-11-18): scegliendo il
// mezzo, le due componenti del suo costo negli ultimi 12 mesi (variabile per
// km o ora motore, fissa per ora di impiego); scegliendo la
// persona, il suo costo orario, altrimenti il costo medio dei parametri. La
// proposta si scrive nel campo, che resta modificabile: si sostituisce solo se
// il campo è vuoto o contiene ancora la proposta di prima (non è stato
// corretto a mano), oppure se cambia il tipo di servizio (cambia l'unità:
// un €/km scritto a mano non vale come €/h).
import { useEffect, useRef, useState } from 'react';

import { leggiCostoMezzi } from '../api/resoconti';
import { leggiSoggetto } from '../api/soggetti';
import type { ParametriStima } from '../types/stima';
import type { ModuloStima, ProposteStima } from '../utils/moduloStima';
import { testoNumero } from '../utils/numeri';

export function useProposteStima(modulo: ModuloStima, parametri: ParametriStima | null, cambia: (m: Partial<ModuloStima>) => void) {
  const [proposte, setProposte] = useState<ProposteStima>({ costoMezzo: null, costoOrario: null });
  // il testo dell'ultima proposta scritta in ciascun campo: se il campo lo contiene ancora, non è stato corretto
  const ultimaMezzo = useRef('');
  const ultimaMezzoOra = useRef('');
  const ultimaOrario = useRef('');
  const ultimoTipo = useRef(modulo.tipo);
  const attuale = useRef(modulo);
  attuale.current = modulo;

  /** Scrive la proposta nel campo se è vuoto, ha ancora la proposta di prima o se si deve (forza) */
  const proponi = (campo: 'costoMezzo' | 'costoMezzoOra' | 'costoOrario', ultima: { current: string }, testo: string, forza = false) => {
    const scritto = attuale.current[campo].trim();
    if (forza || scritto === '' || scritto === ultima.current) cambia({ [campo]: testo });
    ultima.current = testo;
  };

  // il mezzo (e il tipo di servizio: km o ore)
  useEffect(() => {
    let attivo = true;
    const uuid = modulo.mezzo;
    // cambiato il tipo di servizio: cambia l'unità, il costo riparte dalla proposta
    const tipoCambiato = ultimoTipo.current !== modulo.tipo;
    ultimoTipo.current = modulo.tipo;
    if (!uuid) {
      setProposte(p => ({ ...p, costoMezzo: null }));
      proponi('costoMezzo', ultimaMezzo, '', tipoCambiato);
      proponi('costoMezzoOra', ultimaMezzoOra, '');
      return;
    }
    leggiCostoMezzi({ periodo: '12m', soggetto: uuid })
      .then(c => {
        if (!attivo) return;
        const m = c.mezzi[0];
        const k = m?.componenti;
        const giusta = !!k && k.unita === (modulo.tipo === 'km' ? 'km' : 'ore');
        const valore = giusta ? (k?.variabile ?? null) : null;
        const fissoOra = k?.fissoOra ?? null;
        setProposte(p => ({ ...p, costoMezzo: { valore, fissoOra, base: k?.unita ?? m?.base ?? null, nome: m?.nome ?? '' } }));
        proponi('costoMezzo', ultimaMezzo, valore === null ? '' : testoNumero(valore, 3), tipoCambiato);
        proponi('costoMezzoOra', ultimaMezzoOra, fissoOra === null ? '' : testoNumero(fissoOra, 2));
      })
      .catch(() => attivo && setProposte(p => ({ ...p, costoMezzo: { valore: null, fissoOra: null, base: null, nome: '' } })));
    return () => {
      attivo = false;
    };
    // proponi legge lo stato attuale da un riferimento
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulo.mezzo, modulo.tipo]);

  // la persona, o il costo medio dei parametri
  useEffect(() => {
    if (!parametri) return;
    let attivo = true;
    const media = parametri.generali.costoOrarioConducente;
    const leggi = modulo.persona
      ? leggiSoggetto(modulo.persona).then(s =>
          s.costoOrario != null ? { valore: s.costoOrario, fonte: 'persona' as const, nome: s.nome } : { valore: media, fonte: 'media' as const, nome: s.nome }
        )
      : Promise.resolve({ valore: media, fonte: 'media' as const });
    leggi
      .then(p => {
        if (!attivo) return;
        setProposte(x => ({ ...x, costoOrario: p }));
        proponi('costoOrario', ultimaOrario, p.valore === null ? '' : testoNumero(p.valore, 2));
      })
      .catch(() => attivo && setProposte(x => ({ ...x, costoOrario: { valore: media, fonte: 'media' } })));
    return () => {
      attivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulo.persona, parametri]);

  return proposte;
}
