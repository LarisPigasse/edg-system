// src/config/routes.config.ts

/**
 * MAPPA DELLE ROTTE
 *
 * Unica fonte di verità dei path: nessun path scritto a mano nei componenti.
 */
export const ROUTES = {
  HOME: '/',

  // Moduli applicativi: il loro percorso base sta nel manifest
  // (features/<chiave>/module.ts, basePath), raccolti in modules.config.ts

  // Auth
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  CHANGE_PASSWORD: '/change-password',
  SESSION_ENDED: '/sessione-terminata',

  // Accesso assistito (ADR085): stessi path di ASSISTENZA_PATHS in @edg/auth
  ASSISTENZA: '/assistenza',
  ASSISTENZA_TERMINATA: '/assistenza/terminata',

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
