// src/core/notifications/utils/unione.ts
//
// L'elenco di tutti gli avvisi unisce quelli dei moduli dal più recente.
// Ogni modulo ha un segno (fin dove l'ha letto) e un piccolo deposito di
// voci lette e non ancora mostrate. Si prendono le N più recenti fra i
// depositi solo quando ogni modulo non esaurito ne ha almeno N: così una voce
// vecchia di un modulo non passa davanti a una più nuova non ancora letta di
// un altro.
import type { ActiveNotificationSource, PlatformNotification } from '../types';

export interface Cursore {
  sorgente: ActiveNotificationSource;
  /** Quante voci del modulo sono già state lette */
  letti: number;
  /** Lette e non ancora mostrate, dalla più nuova */
  deposito: PlatformNotification[];
  /** Quante con il filtro (ultimo valore dal modulo) */
  totale: number;
  /** Da leggere in tutto nel modulo */
  daLeggere: number;
  /** Niente più da leggere, o il modulo non risponde */
  finito: boolean;
}

export const nuovoCursore = (sorgente: ActiveNotificationSource): Cursore => ({ sorgente, letti: 0, deposito: [], totale: 0, daLeggere: 0, finito: false });

/** I cursori che devono leggere ancora prima di poter mostrare n voci */
export const daRiempire = (cursori: Cursore[], n: number): Cursore[] => cursori.filter(c => !c.finito && c.deposito.length < n);

/** Le n voci più recenti fra i depositi, tolte dai depositi */
export function prendiPiuRecenti(cursori: Cursore[], n: number): PlatformNotification[] {
  const presi: PlatformNotification[] = [];
  while (presi.length < n) {
    let migliore: Cursore | null = null;
    for (const c of cursori) if (c.deposito.length && (!migliore || c.deposito[0].date > migliore.deposito[0].date)) migliore = c;
    if (!migliore) break;
    presi.push(migliore.deposito.shift()!);
  }
  return presi;
}
