// src/core/modules/access.ts
//
// Chi può aprire un modulo, lato interfaccia: stessa regola del backend
// (moduleRules.hasAnyModulePermission, ADR061). Il controllo vero resta nel
// gateway (modulo) e nei servizi (permessi): qui si decide solo cosa mostrare.

/** Il ruolo ha almeno un permesso del modulo? ('*', '<chiave>.*', '<chiave>.<azione>'; '!<chiave>.*' nega) */
export function hasAnyModulePermission(permissions: readonly string[], key: string): boolean {
  if (permissions.includes(`!${key}.*`)) return false;
  return permissions.includes('*') || permissions.some(p => p.startsWith(`${key}.`));
}

export interface ModuleAccess {
  /** useAuth().hasModule: il modulo è in vigore per il tenant (JWT) */
  hasModule: (key: string) => boolean;
  /** useAuth().permissions */
  permissions: readonly string[];
}

/** Modulo in vigore per il tenant E almeno un permesso del ruolo */
export const canOpenModule = (key: string, access: ModuleAccess): boolean =>
  access.hasModule(key) && hasAnyModulePermission(access.permissions, key);
