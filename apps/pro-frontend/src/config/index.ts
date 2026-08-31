// src/config/index.ts
import type { EdgConfig } from '@edg/ui';

import { ROUTES } from './routes.config';
import { MODULES } from './navigation.config';

/**
 * IDENTITÀ E CONFIGURAZIONE DEL GESTIONALE
 *
 * È il pannello di controllo: tutto ciò che distingue questo frontend dagli
 * altri della piattaforma vive qui. `@edg/ui` non importa nulla da questo file —
 * riceve l'oggetto `EDG_CONFIG` tramite `<EdgConfigProvider>`.
 *
 * ADR012: nome, logo e palette diventeranno funzione del dominio di accesso,
 * così lo stesso build può presentarsi come EDG o come un prodotto a marchio
 * proprio. Il punto di variazione è questo, e uno solo.
 */
export const APP_CONFIG = {
  SIGLA: 'Edg',
  COLORESIGLA: 'text-sky-600',
  NAME: 'Pro',
  TITOLO: 'Professional',
  COLORE: 'text-red-600',
  TAGLINE: 'Gestione della piattaforma',
  COPYRIGHT: `© ${new Date().getFullYear()} Express Delivery`,
  VERSION: import.meta.env.VITE_APP_VERSION || '0.1.0',
} as const;

/** Configurazione consegnata al design system. */
export const EDG_CONFIG: EdgConfig = {
  app: {
    sigla: APP_CONFIG.SIGLA,
    coloreSigla: APP_CONFIG.COLORESIGLA,
    name: APP_CONFIG.NAME,
    titolo: APP_CONFIG.TITOLO,
    colore: APP_CONFIG.COLORE,
    tagline: APP_CONFIG.TAGLINE,
    copyright: APP_CONFIG.COPYRIGHT,
    version: APP_CONFIG.VERSION,
    // Unico elemento grafico che distingue questo frontend dal portale utenti
    icon: 'iconPro',
  },
  routes: {
    home: ROUTES.HOME,
    login: ROUTES.LOGIN,
    forgotPassword: ROUTES.FORGOT_PASSWORD,
    settings: ROUTES.SETTINGS,
    changePassword: ROUTES.CHANGE_PASSWORD,
    notFound: ROUTES.NOT_FOUND,
  },
  modules: MODULES,
  layout: {
    backgroundImage: 'bg',
    innerPageBgColor: 'bg-bg-secondary',
    innerPageBgOpacity: 'opacity-80',
    innerPageBgZIndex: '-z-10',
    footerEnabled: true,
  },
};

export { ROUTES } from './routes.config';
export { MODULES } from './navigation.config';
