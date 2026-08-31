// packages/ui/src/config/EdgConfigContext.ts
import { createContext } from 'react';
import type { EdgConfigValue } from './types';

/**
 * Contesto di configurazione del design system.
 *
 * È `null` finché un `EdgConfigProvider` non lo popola: `useEdgConfig` lo
 * segnala con un errore esplicito invece di lasciare che i componenti
 * falliscano più tardi con un valore indefinito.
 */
export const EdgConfigContext = createContext<EdgConfigValue | null>(null);
