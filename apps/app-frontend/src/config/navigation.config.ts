// src/config/navigation.config.ts
import { Home, type EdgModuleConfig } from '@edg/ui';

import { ROUTES } from './routes.config';

/**
 * Moduli disponibili nel portale utenti.
 *
 * Questa è la dichiarazione di ciò che *esiste*. Ciò che ciascun utente *vede*
 * è l'intersezione fra i moduli attivi per il suo tenant (ADR009) e i permessi
 * del suo ruolo: il filtro va applicato qui prima di consegnare la lista a
 * `EdgConfigProvider`.
 */
export const MODULES: EdgModuleConfig[] = [
  {
    id: 'home',
    label: 'HOME',
    href: ROUTES.HOME,
    icon: Home,
  },
  // I moduli applicativi (Vigilo, logistica, ...) si aggiungono qui, ciascuno
  // con il proprio `permission` per il filtro lato UX.

];
