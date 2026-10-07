// src/core/modules/index.ts — infrastruttura dei moduli di app-frontend (fase 4)
export type { AppModuleManifest, ModulePage, ModuleMenuItem, MyModule } from './types';
export { canOpenModule, hasAnyModulePermission } from './access';
export type { ModuleAccess } from './access';
export { fetchMyModules } from './api';
export { MyModulesProvider, useMyModules, useMyModule } from './MyModulesContext';
export { buildModuleMenu, modulePath } from './menu';
export type { ModuleMenuContext } from './menu';
export { default as ModuleRoutes } from './ModuleRoutes';
