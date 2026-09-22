// src/config/routes.config.ts

/**
 * MAPPA DELLE ROTTE
 *
 * Unica fonte di verità dei path: nessun path scritto a mano nei componenti.
 */
export const ROUTES = {
  HOME: '/',

  // Moduli applicativi — si aggiungono qui man mano che vengono attivati
  // (es. VIGILO: '/vigilo', LOGISTICA: '/logistica')

  // BASE: gestione delle tabelle di system-service (operatori, reparti, anagrafiche)
  BASE_ANAGRAFICHE: '/base/anagrafiche',
  BASE_OPERATORI: '/base/operatori',
  BASE_TABELLE: '/base/tabelle',

  // SISTEMA: gestione di account, permessi e tenant (ADR024) — solo root
  SISTEMA_TENANT: '/sistema/tenant',
  SISTEMA_ACCOUNT: '/sistema/account',
  SISTEMA_SESSIONI: '/sistema/sessioni',
  SISTEMA_RUOLI: '/sistema/ruoli',

  // Strumenti di sviluppo del design system (nascosti in produzione)
  DESIGN_TEMA: '/design/tema',
  DESIGN_COMPONENTI: '/design/componenti',
  DESIGN_ICONE: '/design/icone',

  // Auth
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  CHANGE_PASSWORD: '/change-password',
  SESSION_ENDED: '/sessione-terminata',

  // User menu
  SETTINGS: '/settings',
  PROFILE: '/profile',
  NOT_FOUND: '/404',

  // Footer
  TERMS: '/terms',
  SUPPORT: '/support',
} as const;

export type RouteKeys = keyof typeof ROUTES;
export type RouteValues = (typeof ROUTES)[RouteKeys];
