// src/features/vigilo/utils/cadenza.ts
//
// Le regole pure dell'editor della cadenza (2026-11-19, passo 2b): il tipo
// (a tempo, a uso, tempo e uso, una tantum), il passaggio da un tipo
// all'altro con valori di partenza sensati, la forma normalizzata (per
// confrontare e per inviare al servizio) e gli errori dei campi. La frase in
// parole la scrive il servizio (anteprima), che fa anche i controlli di
// coerenza (date del soggetto, contatori delle categorie).
import type { Cadenza, Durata } from '../types/cadenza';

export type TipoCadenza = 'tempo' | 'uso' | 'entrambi' | 'una-tantum';

export const LIMITI_CADENZA = { durata: 1024, uso: 1 << 24, fasce: 8 } as const;

const UN_ANNO: Durata = { valore: 1, unita: 'anni' };

/** Il tipo della cadenza (pura) */
export const tipoDi = (c: Cadenza): TipoCadenza => (c.tempo && c.uso ? 'entrambi' : c.tempo ? 'tempo' : c.uso ? 'uso' : 'una-tantum');

/** La cadenza passata a un altro tipo, tenendo ciò che si può (pura) */
export function conTipo(c: Cadenza, tipo: TipoCadenza): Cadenza {
  const tempo = tipo === 'tempo' || tipo === 'entrambi' ? (c.tempo ?? UN_ANNO) : null;
  const uso = tipo === 'uso' || tipo === 'entrambi' ? (c.uso ?? { valore: 32768, unita: 'km' as const }) : null;
  return {
    ...c,
    tempo,
    uso,
    // senza tempo non hanno senso: finestra, prima diversa, fasce, fine mese
    ancoraggio: tempo ? c.ancoraggio : 'esecuzione',
    finestra: tempo && c.ancoraggio === 'finestra' ? (c.finestra ?? null) : null,
    prima: tempo ? c.prima : null,
    fasce: tempo ? (c.fasce ?? null) : null,
    fineMese: tempo ? c.fineMese : false,
  };
}

/** La forma da confrontare e da inviare: finestra e fasce sempre presenti (null se assenti) (pura) */
export const normalizzata = (c: Cadenza): Cadenza => ({
  tempo: c.tempo,
  uso: c.uso,
  ancoraggio: c.ancoraggio,
  fineMese: c.fineMese,
  prima: c.prima,
  finestra: c.ancoraggio === 'finestra' ? (c.finestra ?? null) : null,
  fasce: c.fasce ?? null,
});

const durataValida = (d: Durata | null | undefined) => !!d && Number.isInteger(d.valore) && d.valore >= 1 && d.valore <= LIMITI_CADENZA.durata;

/** Gli errori dei campi, in parole; vuoto = valida per quanto si vede qui (pura) */
export function erroriCadenza(c: Cadenza): string[] {
  const e: string[] = [];
  if (c.tempo && !durataValida(c.tempo)) e.push(`La durata va da 1 a ${LIMITI_CADENZA.durata}`);
  if (c.uso && !(Number.isInteger(c.uso.valore) && c.uso.valore >= 1 && c.uso.valore <= LIMITI_CADENZA.uso))
    e.push(`I ${c.uso.unita} vanno da 1 a ${LIMITI_CADENZA.uso.toLocaleString('it-IT')}`);
  if (c.ancoraggio === 'finestra' && !durataValida(c.finestra)) e.push('Indica quanto è lunga la finestra');
  if (c.prima && (!durataValida(c.prima.tempo) || !c.prima.da)) e.push('Indica da quale data e dopo quanto cade la prima scadenza');
  if (c.fasce) {
    if (!c.fasce.da) e.push("Indica da quale data si conta l'età");
    if (!c.fasce.elenco.length) e.push("Aggiungi almeno una fascia d'età");
    if (c.fasce.elenco.some(f => !durataValida(f.oltre) || !durataValida(f.tempo))) e.push('Ogni fascia vuole età e durata da 1 a 1024');
  }
  return e;
}
