// src/features/sistema/utils/datiModuli.ts — i dati di un tenant in un modulo, in parole
//
// Un solo modo di elencarli (fase 3, ADR117): la riga del modulo nella
// finestra Moduli e l'elenco "Sparisce" della conferma si leggono uguali.

import type { RiepilogoDati, RigaDati } from '../types/datiModuli';
import { dimensioneLeggibile } from './dimensioni';

/** Ordine di lettura (il servizio le dà nell'ordine di eliminazione): prima ciò che conta per chi guarda */
const PRIMA = ['soggetti', 'scadenze', 'registrazioni', 'allegati', 'fornitori', 'rifornimenti', 'categorie', 'controlli'];
const posto = (tabella: string) => (PRIMA.includes(tabella) ? PRIMA.indexOf(tabella) : PRIMA.length);

/** Dettagli da mettere accanto a una voce: scadenze aperte/scadute, spazio dei documenti */
export function dettagliRiepilogo(riepilogo: RiepilogoDati): Record<string, string> {
  return {
    scadenze: `aperte ${riepilogo.scadenze.aperte}, scadute ${riepilogo.scadenze.scadute}`,
    allegati: dimensioneLeggibile(riepilogo.documenti.byte),
  };
}

/** Le voci con righe, nell'ordine di lettura, al più `max` e poi "e altro"; `accanto` aggiunge un dettaglio a una voce */
export function vociDati(righe: RigaDati[], { max = Infinity, accanto = {} }: { max?: number; accanto?: Record<string, string> } = {}): string {
  const piene = righe.filter(r => r.righe > 0).sort((a, b) => posto(a.tabella) - posto(b.tabella));
  const testo = piene
    .slice(0, max)
    .map(r => `${r.etichetta} ${r.righe.toLocaleString('it-IT')}${accanto[r.tabella] ? ` (${accanto[r.tabella]})` : ''}`)
    .join(' · ');
  return piene.length > max ? `${testo} · e altro` : testo;
}

/** "1 riga", "212 righe" */
export const righeInParole = (n: number) => `${n.toLocaleString('it-IT')} ${n === 1 ? 'riga' : 'righe'}`;
