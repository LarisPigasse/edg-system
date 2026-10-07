// src/core/modules/types.ts
//
// I moduli di app-frontend (ADR010, ADR047, fase 4).
//
// Un modulo NASCE NEL CODICE e il database lo accende:
//   - il manifest (features/<chiave>/module.ts) dice cosa il modulo è in questo
//     frontend: rotte, pagine, menu, icona;
//   - auth-service dice se l'utente può usarlo adesso (JWT: `modules`) e come
//     appare nella home (GET /auth/me/modules: stato, branding, versione).
// La chiave è la stessa ovunque: catalogo, JWT, gateway, permessi, cartella.
import type { ComponentType, LazyExoticComponent } from 'react';
import type { EdgModuleConfig, HomeModuleStatus, ModuleBranding } from '@edg/ui';

/** Una pagina del modulo, caricata a richiesta */
export interface ModulePage {
  /** Percorso relativo alla base del modulo; '' = home del modulo */
  path: string;
  component: LazyExoticComponent<ComponentType>;
  /** Permesso richiesto (es. 'vigilo.read'); assente = basta poter usare il modulo */
  permission?: string;
}

/** Voce del sottomenu del modulo nell'header */
export interface ModuleMenuItem {
  id: string;
  label: string;
  /** Percorso relativo alla base del modulo */
  path: string;
  permission?: string;
}

/** Il manifest: cosa il modulo è in questo frontend */
export interface AppModuleManifest {
  /** Chiave del catalogo (modules.key): immutabile */
  key: string;
  /** Nome di riserva, finché il catalogo non risponde */
  name: string;
  /** Voce di menu (maiuscolo, come le altre) */
  label: string;
  /** Prefisso delle rotte del modulo (es. '/vigilo') */
  basePath: string;
  icon: EdgModuleConfig['icon'];
  pages: ModulePage[];
  /** Sottomenu; assente o vuoto = la voce porta alla home del modulo */
  menu?: ModuleMenuItem[];
}

/** Un modulo come lo restituisce GET /auth/me/modules (ADR061) */
export interface MyModule {
  key: string;
  name: string;
  description: string | null;
  product: string;
  version: string;
  branding: ModuleBranding | null;
  status: HomeModuleStatus;
  /** ISO; solo per prova e attivo con scadenza */
  endsAt: string | null;
}
