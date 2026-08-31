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

  // Auth
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  CHANGE_PASSWORD: '/change-password',

  // User menu
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
} as const;

export type RouteKeys = keyof typeof ROUTES;
export type RouteValues = (typeof ROUTES)[RouteKeys];
