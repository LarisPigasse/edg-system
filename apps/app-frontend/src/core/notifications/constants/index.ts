// src/core/notifications/constants/index.ts
//
// La pagina degli avvisi della piattaforma (B8d-1 bis): dove sta, quante voci
// per pagina e le parole dei filtri.
import type { NotificationFilter } from '../types';

/** La pagina di tutti gli avvisi, collegata in fondo alla campanella */
export const NOTIFICATIONS_PATH = '/avvisi';

/** Voci per pagina ("Mostra altri") */
export const NOTIFICATIONS_PAGE_SIZE = 32;

export const NOTIFICATION_FILTERS: { value: NotificationFilter; label: string; empty: string }[] = [
  { value: 'all', label: 'Tutti', empty: 'Nessun avviso, per ora.' },
  { value: 'unread', label: 'Da leggere', empty: 'Nessun avviso da leggere.' },
  { value: 'resolved', label: 'Non più attuali', empty: 'Nessun avviso superato: quando una cosa si sistema, i suoi avvisi finiscono qui.' },
];
