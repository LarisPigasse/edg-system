// src/features/vigilo/utils/azioni.ts
import type { Azione } from '../constants/azioni';
import type { Capacita } from '../types/io';
import type { DettaglioScadenza } from '../types/scadenze';

/**
 * Le azioni possibili su una scadenza, nell'ordine del pannello.
 *   ufficio (write)  senza data (da completare) la prima cosa è inserirla; il
 *                    rinvio sposta una data che c'è già, se il controllo lo
 *                    consente; la lettura serve se c'è un contatore. Con una
 *                    segnalazione dell'addetto in attesa si decide su quella.
 *   addetto (own)    segnala "fatto", se non l'ha già fatto qualcuno (B9c)
 */
export function azioniDi(s: DettaglioScadenza, c: Capacita): Azione[] {
  if (s.chiusa) return [];
  if (c.write) {
    if (s.segnalazione) return ['conferma', 'respingi'];
    const azioni: Azione[] = [];
    if (s.stato === 'da-completare') azioni.push('completa');
    azioni.push('registra');
    if (s.rinviabile && s.scadeIl) azioni.push('rinvia');
    if (s.contatore) azioni.push('lettura');
    return azioni;
  }
  return c.own && !s.segnalazione ? ['segnala'] : [];
}
