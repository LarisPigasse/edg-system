// src/core/notifications/types.ts
//
// Gli avvisi dei moduli nella campanella dell'header (ADR091). Ogni modulo
// che ha avvisi dichiara nel manifest una sorgente: come leggerli e come
// segnarli letti. core/ le unisce; il modulo non sa nulla della campanella.
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

/** La sorgente degli avvisi di un modulo */
export interface ModuleNotificationSource {
  read: (limit: number) => Promise<ModuleNotificationPage>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  /** Collegamento in fondo alla campanella (es. la pagina dei propri avvisi e delle preferenze) */
  footer?: { label: string; href: string };
}

/** Una sorgente attiva per l'utente, col nome del modulo da mostrare */
export interface ActiveNotificationSource {
  key: string;
  name: string;
  source: ModuleNotificationSource;
}
