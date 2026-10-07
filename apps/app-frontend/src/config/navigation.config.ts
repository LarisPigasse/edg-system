// src/config/navigation.config.ts
import { Home, type EdgModuleConfig } from '@edg/ui';

import { buildModuleMenu, type ModuleMenuContext } from '../core/modules';
import { MODULE_MANIFESTS } from './modules.config';
import { ROUTES } from './routes.config';

const HOME: EdgModuleConfig = {
  id: 'home',
  label: 'HOME',
  href: ROUTES.HOME,
  icon: Home,
};

/** Menu prima del login o finché l'utente non è noto: solo la home */
export const MODULES: EdgModuleConfig[] = [HOME];

/**
 * Menu dell'utente: la home, poi un modulo per ogni manifest che può aprire
 * (in vigore per il tenant nel JWT e con almeno un permesso del ruolo, ADR009).
 * Ricalcolato in App.tsx (AppConfigProvider) a ogni cambio di utente, moduli o
 * catalogo. Il controllo vero resta nel gateway: qui si decide cosa mostrare.
 */
export const getModules = (ctx: ModuleMenuContext): EdgModuleConfig[] => [
  HOME,
  ...buildModuleMenu(MODULE_MANIFESTS, ctx),
];
