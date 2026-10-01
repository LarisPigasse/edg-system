// src/config/navigation.config.ts
import { Home, Palette, Database, Shield, type EdgModuleConfig } from '@edg/ui';

import { ROUTES } from './routes.config';

/**
 * Moduli disponibili nel portale utenti.
 *
 * Questa è la dichiarazione di ciò che *esiste*. Ciò che ciascun utente *vede*
 * è l'intersezione fra i moduli attivi per il suo tenant (ADR009) e i permessi
 * del suo ruolo. La maggior parte del filtro resta dichiarativo (`permission`,
 * usato lato UX in attesa di un filtro generico — vedi commento su BASE);
 * SISTEMA è l'eccezione voluta: root, non un permesso RBAC delegabile (stesso
 * criterio del `requireRoot()` di backend), quindi il filtro è qui, a monte,
 * tramite il parametro `isRoot` — vedi App.tsx.
 */
export function getModules(isRoot: boolean): EdgModuleConfig[] {
  return [
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

    // SISTEMA: gestione di account, permessi e tenant (ADR024) — solo root,
    // sempre l'ultima voce del menu. Cresce con Account e Ruoli man mano che
    // si aggiungono, stesso schema di BASE.
    ...(isRoot
      ? [
          {
            id: 'sistema',
            label: 'SISTEMA',
            href: ROUTES.SISTEMA_ACCOUNT,
            icon: Shield,
            children: [
              { id: 'account', label: 'Account', href: ROUTES.SISTEMA_ACCOUNT },
              { id: 'ruoli', label: 'Ruoli', href: ROUTES.SISTEMA_RUOLI },
              { id: 'tenant', label: 'Tenant', href: ROUTES.SISTEMA_TENANT },
              { id: 'sessioni', label: 'Sessioni', href: ROUTES.SISTEMA_SESSIONI },
              // 'sistema.logs' e' un permesso gia' assegnabile (vedi permissionCatalog.ts),
              // ma qui la voce resta root-only come le altre: il filtro per permesso sul
              // singolo figlio non e' ancora cablato in Header.tsx/MobileMenu.tsx (il campo
              // EdgSubMenuItem.permission esiste nel tipo ma nessun renderer lo legge oggi).
              { id: 'logs', label: 'Logs', href: ROUTES.SISTEMA_LOGS },
              // Salute della piattaforma e allarmi (ADR038) — sempre l'ultima voce
              { id: 'info', label: 'Info', href: ROUTES.SISTEMA_INFO },
            ],
          } satisfies EdgModuleConfig,
        ]
      : []),

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
}
