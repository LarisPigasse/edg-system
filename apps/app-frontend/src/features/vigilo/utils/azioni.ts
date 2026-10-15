// src/features/vigilo/utils/azioni.ts
import type { Azione } from '../constants/azioni';
import type { DettaglioScadenza } from '../types/scadenze';

/**
 * Le azioni possibili su una scadenza, nell'ordine del pannello. Senza data
 * (da completare) la prima cosa è inserirla; il rinvio sposta una data che
 * c'è già, se il controllo lo consente; la lettura serve se c'è un contatore.
 */
export function azioniDi(s: DettaglioScadenza): Azione[] {
  if (s.chiusa) return [];
  const azioni: Azione[] = [];
  if (s.stato === 'da-completare') azioni.push('completa');
  azioni.push('registra');
  if (s.rinviabile && s.scadeIl) azioni.push('rinvia');
  if (s.contatore) azioni.push('lettura');
  return azioni;
}
