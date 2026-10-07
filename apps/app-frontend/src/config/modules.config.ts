// src/config/modules.config.ts
//
// REGISTRO DEI MODULI di questo frontend (fase 4): l'unico punto che conosce
// tutte le feature. Aggiungere un modulo = scriverne il manifest in
// features/<chiave>/module.ts e aggiungerlo qui. Il catalogo di auth-service
// (stessa chiave) decide poi chi lo vede e chi lo usa.
import type { AppModuleManifest } from '../core/modules';
import { vigiloModule } from '../features/vigilo/module';

export const MODULE_MANIFESTS: readonly AppModuleManifest[] = [vigiloModule];

const BY_KEY = new Map(MODULE_MANIFESTS.map(m => [m.key, m]));

/** Il manifest di un modulo, se questo frontend lo contiene */
export const getManifest = (key: string): AppModuleManifest | undefined => BY_KEY.get(key);
