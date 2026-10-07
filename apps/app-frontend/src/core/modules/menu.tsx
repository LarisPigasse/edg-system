// src/core/modules/menu.tsx
//
// Voci dell'header per i moduli (fase 4): una per ogni manifest che l'utente
// può aprire (modulo in vigore nel JWT + almeno un permesso del ruolo), con il
// sottomenu filtrato per permessi e, come `brand`, il titolo del modulo (ADR054)
// che l'header mostra quando si è dentro il modulo.
import { ModuleBrand, type EdgModuleConfig, type ModuleBrandImages } from '@edg/ui';

import { canOpenModule, type ModuleAccess } from './access';
import type { AppModuleManifest, MyModule } from './types';

export interface ModuleMenuContext extends ModuleAccess {
  hasPermission: (permission: string) => boolean;
  /** Dati del catalogo per chiave (nome e branding del titolo) */
  myModules: ReadonlyMap<string, MyModule>;
  /** Immagini del modulo presenti in questo frontend */
  images: (key: string) => ModuleBrandImages;
}

/** Unisce la base del modulo e un percorso relativo, senza doppie barre */
export const modulePath = (basePath: string, path: string): string =>
  path ? `${basePath.replace(/\/$/, '')}/${path.replace(/^\//, '')}` : basePath;

export function buildModuleMenu(manifests: readonly AppModuleManifest[], ctx: ModuleMenuContext): EdgModuleConfig[] {
  return manifests
    .filter(m => canOpenModule(m.key, ctx))
    .map(m => {
      const children = (m.menu ?? [])
        .filter(item => !item.permission || ctx.hasPermission(item.permission))
        .map(item => ({ id: item.id, label: item.label, href: modulePath(m.basePath, item.path) }));
      const data = ctx.myModules.get(m.key);

      return {
        id: m.key,
        label: m.label,
        href: children[0]?.href ?? m.basePath,
        icon: m.icon,
        ...(children.length > 0 ? { children } : {}),
        brand: (
          <ModuleBrand element='title' name={data?.name ?? m.name} branding={data?.branding} images={ctx.images(m.key)} />
        ),
      };
    });
}
