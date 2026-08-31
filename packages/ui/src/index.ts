// =============================================================================
// @edg/ui — DESIGN SYSTEM DELLA PIATTAFORMA EDG
// =============================================================================
//
// Punto di accesso unico. Le applicazioni importano da '@edg/ui', mai dai
// percorsi interni del pacchetto.
//
// Il pacchetto non conosce l'applicazione che lo ospita: nome, rotte, moduli e
// parametri di layout gli arrivano da <EdgConfigProvider>. L'unico vincolo che
// impone è che lo store Redux monti `uiSliceReducer` sotto la chiave `ui`.
//

// --- Configurazione (ponte verso l'applicazione ospite) ---
export { EdgConfigProvider, useEdgConfig } from './config';
export type {
  EdgConfig,
  EdgConfigValue,
  EdgAppConfig,
  EdgRoutes,
  EdgModuleConfig,
  EdgSubMenuItem,
  EdgLayoutConfig,
} from './config';

// --- Stato UI condiviso (tema, footer, menu) ---
export {
  useUISettings,
  uiSliceReducer,
  persistenceMiddleware,
  storageUtils,
  initializeFromStorage,
  initializeTheme,
  APP_DATA,
  MESSAGES,
} from './state';

// --- Componenti ---
export * from './components/ui';
export * from './components/form';
export * from './components/feedback';
export * from './components/layout';
export * from './components/data';
export * from './components/navigation';
export * from './components/info';
export * from './components/actions';

// --- Catalogo dei componenti ---
// L'Explorer importa ogni showcase: si importa da '@edg/ui/explorer',
// preferibilmente con lazy(), così non pesa su chi non lo monta.

// --- Hook ---
export * from './hooks';

// --- Utility ---
export * from './utils';

// --- Tipi condivisi ---
export type { ComponentData } from './types';
