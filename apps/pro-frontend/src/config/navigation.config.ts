// src/config/navigation.config.ts
import { Home, Palette } from 'lucide-react';
import type { EdgModuleConfig } from '@edg/ui';

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

  // Design system: solo in sviluppo, sparisce dal bundle di produzione
  ...(import.meta.env.DEV
    ? [
        {
          id: 'design',
          label: 'DESIGN',
          href: '/design',
          icon: Palette,
          children: [
            { id: 'tema', label: 'Tema', href: ROUTES.DESIGN_TEMA },
            { id: 'componenti', label: 'Componenti', href: ROUTES.DESIGN_COMPONENTI },
          ],
        } satisfies EdgModuleConfig,
      ]
    : []),
];
