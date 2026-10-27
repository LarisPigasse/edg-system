// src/core/notifications/types/index.ts
//
// Gli avvisi dei moduli nella campanella dell'header (ADR091) e nella pagina
// della piattaforma /avvisi (B8d-1 bis). Ogni modulo che ha avvisi dichiara
// nel manifest una sorgente: come leggerli, sfogliarli, segnarli letti e,
// se vuole, il componente delle sue preferenze. core/ le unisce; il modulo
// non sa nulla della campanella né della pagina.
import type { ComponentType } from 'react';
import type { EdgNotificationTone } from '@edg/ui';

/** Un avviso come lo dà il modulo (id del modulo, senza prefisso) */
export interface ModuleNotification {
  id: string;
  text: string;
  detail?: string;
  tone?: EdgNotificationTone;
  unread: boolean;
  resolved?: boolean;
  /** ISO */
  date: string;
  /** Percorso dell'app a cui porta il clic */
  href?: string;
}

export interface ModuleNotificationPage {
  /** Da leggere in tutto */
  unread: number;
  /** Le più recenti, dalla più nuova */
  items: ModuleNotification[];
}

/** Quali avvisi: tutti, solo da leggere, solo quelli che non servono più */
export type NotificationFilter = 'all' | 'unread' | 'resolved';

export interface ModuleNotificationQuery {
  offset: number;
  limit: number;
  filter: NotificationFilter;
}

export interface ModuleNotificationList extends ModuleNotificationPage {
  /** Quanti con il filtro scelto */
  total: number;
}

/** La sorgente degli avvisi di un modulo */
export interface ModuleNotificationSource {
  /** Le più recenti, per la campanella */
  read: (limit: number) => Promise<ModuleNotificationPage>;
  /** A pagine e con filtro, per la pagina /avvisi; assente = il modulo non compare nell'elenco */
  list?: (query: ModuleNotificationQuery) => Promise<ModuleNotificationList>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  /** Le preferenze degli avvisi del modulo, mostrate nella pagina /avvisi (autonomo: legge e salva da sé) */
  settings?: ComponentType;
}

/** Una sorgente attiva per l'utente, col nome del modulo da mostrare */
export interface ActiveNotificationSource {
  key: string;
  name: string;
  source: ModuleNotificationSource;
}

/** Un avviso nella pagina /avvisi: id con il prefisso del modulo e nome del modulo */
export interface PlatformNotification extends ModuleNotification {
  /** 'vigilo:<uuid>' */
  key: string;
  /** Chiave del modulo */
  module: string;
  /** Nome del modulo da mostrare */
  source: string;
}
