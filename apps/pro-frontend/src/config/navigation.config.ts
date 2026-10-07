// src/config/navigation.config.ts
import { Home, Palette, Database, Shield, type EdgModuleConfig, type EdgSubMenuItem } from '@edg/ui';

import { ROUTES } from './routes.config';

/** Verifica di un permesso dell'utente corrente (useAuth().hasPermission) */
export type PermissionCheck = (permission: string) => boolean;

/** Permesso riservato a root: il jolly '*' lo ha solo lui */
const ROOT_ONLY = '*';

/**
 * Tiene solo le sottovoci che l'utente può vedere. Il permesso è dichiarato
 * nel campo standard `EdgSubMenuItem.permission`, ma Header/MobileMenu di
 * @edg/ui oggi non lo leggono: il filtro si applica qui, a monte (ADR050).
 */
const visibleChildren = (children: EdgSubMenuItem[], can: PermissionCheck): EdgSubMenuItem[] =>
  children.filter(child => !child.permission || can(child.permission));

/**
 * Modulo con sottovoci filtrate: sparisce se non resta nessuna voce, e il suo
 * link punta alla prima voce visibile (es. l'admin entra in SISTEMA da Account).
 */
const withVisibleChildren = (module: EdgModuleConfig, can: PermissionCheck): EdgModuleConfig[] => {
  const children = visibleChildren(module.children ?? [], can);
  return children.length > 0 ? [{ ...module, href: children[0].href, children }] : [];
};

/**
 * Moduli disponibili nel portale utenti.
 *
 * Questa è la dichiarazione di ciò che *esiste*. Ciò che ciascun utente *vede*
 * è l'intersezione fra i moduli attivi per il suo tenant (ADR009) e i permessi
 * del suo ruolo. Per SISTEMA ogni sottovoce dichiara il proprio permesso e il
 * filtro si applica qui, con `can` = useAuth().hasPermission — vedi App.tsx.
 * Il controllo vero resta nel backend: qui si decide solo cosa mostrare.
 */
export function getModules(can: PermissionCheck = () => false): EdgModuleConfig[] {
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

    // SISTEMA: account, ruoli, tenant e piattaforma — sempre l'ultima voce.
    // ADR050: l'admin EDG vede solo Account e Tenant (permessi delegabili
    // 'sistema.account' e 'sistema.tenant'); tutto il resto resta a root.
    // Le attivazioni dei moduli dell'admin stanno dentro la pagina Tenant.
    ...withVisibleChildren(
      {
        id: 'sistema',
        label: 'SISTEMA',
        href: ROUTES.SISTEMA_ACCOUNT,
        icon: Shield,
        children: [
          { id: 'account', label: 'Account', href: ROUTES.SISTEMA_ACCOUNT, permission: 'sistema.account' },
          { id: 'ruoli', label: 'Ruoli', href: ROUTES.SISTEMA_RUOLI, permission: ROOT_ONLY },
          { id: 'tenant', label: 'Tenant', href: ROUTES.SISTEMA_TENANT, permission: 'sistema.tenant' },
          // Catalogo moduli: solo root; le attivazioni per tenant stanno nella pagina del tenant
          { id: 'moduli', label: 'Moduli', href: ROUTES.SISTEMA_MODULI, permission: ROOT_ONLY },
          { id: 'sessioni', label: 'Sessioni', href: ROUTES.SISTEMA_SESSIONI, permission: ROOT_ONLY },
          // 'sistema.logs' e' gia' un permesso assegnabile (permissionCatalog.ts), ma la
          // voce resta a root finche' non si decide di delegarla
          { id: 'logs', label: 'Logs', href: ROUTES.SISTEMA_LOGS, permission: ROOT_ONLY },
          // Salute della piattaforma e allarmi (ADR038) — sempre l'ultima voce
          { id: 'info', label: 'Info', href: ROUTES.SISTEMA_INFO, permission: ROOT_ONLY },
        ],
      },
      can
    ),

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
