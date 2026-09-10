// src/config/navigation.config.ts
import { Home, Palette, Database, type EdgModuleConfig } from '@edg/ui';

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

  // BASE: gestione delle tabelle di system-service. Un solo permesso
  // 'system' per tutto il gruppo per ora (i ruoli restano invariati);
  // si raffina quando servirà differenziare le singole sotto-voci.
  {
    id: 'base',
    label: 'BASE',
    href: ROUTES.BASE_ANAGRAFICHE,
    icon: Database,
    permission: 'system',
    children: [
      { id: 'anagrafiche', label: 'Anagrafiche', href: ROUTES.BASE_ANAGRAFICHE },
      { id: 'operatori', label: 'Operatori', href: ROUTES.BASE_OPERATORI },
      { id: 'tabelle', label: 'Tabelle', href: ROUTES.BASE_TABELLE },
    ],
  },

  // Design system: solo in sviluppo, sparisce dal bundle di produzione
  ...(import.meta.env.DEV
    ? [
        {
          id: 'design',
          label: 'DESIGN',
          href: ROUTES.DESIGN_TEMA,
          icon: Palette,
          children: [
            { id: 'tema', label: 'Tema', href: ROUTES.DESIGN_TEMA },
            { id: 'componenti', label: 'Componenti', href: ROUTES.DESIGN_COMPONENTI },
            { id: 'icone', label: 'Icone', href: ROUTES.DESIGN_ICONE },
          ],
        } satisfies EdgModuleConfig,
      ]
    : []),
];
