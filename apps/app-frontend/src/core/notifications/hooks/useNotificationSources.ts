// src/core/notifications/hooks/useNotificationSources.ts
//
// Le sorgenti degli avvisi attive per l'utente, come le calcola App per la
// campanella, e "rileggi la campanella": la pagina /avvisi e le pagine dei
// moduli le usano senza ricalcolarle, e dopo un "letto" il numero della
// campanella si aggiorna subito.
import { createContext, useContext } from 'react';

import type { ActiveNotificationSource } from '../types';

export interface NotificationSourcesValue {
  sources: ActiveNotificationSource[];
  /** Rilegge la campanella */
  refresh: () => void;
}

export const NotificationSourcesContext = createContext<NotificationSourcesValue>({ sources: [], refresh: () => undefined });

export const useNotificationSources = (): NotificationSourcesValue => useContext(NotificationSourcesContext);
