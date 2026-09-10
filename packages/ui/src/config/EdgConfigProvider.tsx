// packages/ui/src/config/EdgConfigProvider.tsx
import React, { useMemo } from 'react';

import { EdgConfigContext } from './EdgConfigContext';
import type { EdgConfig, EdgConfigValue, EdgModuleConfig } from './types';

interface EdgConfigProviderProps {
  /** Configurazione dell'applicazione ospite. */
  config: EdgConfig;
  children: React.ReactNode;
}

/**
 * Consegna a @edg/ui l'identità, le rotte, i moduli e i parametri di layout
 * dell'applicazione che lo ospita.
 *
 * Il design system non importa nulla da `src/config` dell'applicazione: tutto
 * ciò che gli serve passa da qui. È la ragione per cui la stessa shell può
 * servire il gestionale operatori e il portale clienti senza duplicazioni.
 *
 * @example
 * <EdgConfigProvider config={edgConfig}>
 *   <App />
 * </EdgConfigProvider>
 */
export const EdgConfigProvider: React.FC<EdgConfigProviderProps> = ({ config, children }) => {
  const value = useMemo<EdgConfigValue>(() => {
    const { modules, routes } = config;

    const isHomeActive = (pathname: string): boolean => pathname === '/' || pathname === routes.home;

    // Un modulo è attivo se il percorso corrisponde al suo href oppure
    // all'href di una delle sue sotto-voci. Separato da getActiveModule
    // perché l'href del modulo è solo "dove atterro cliccando la label
    // del gruppo": non è detto che sia anche un prefisso comune a tutte
    // le sue voci figlie (es. BASE atterra su /base/tabelle, ma deve
    // restare "attivo" anche su /base/operatori).
    const moduleMatchesPath = (module: EdgModuleConfig, pathname: string): boolean => {
      if (pathname.startsWith(module.href)) return true;
      return (module.children ?? []).some(child => pathname.startsWith(child.href));
    };

    const getActiveModule = (pathname: string): EdgModuleConfig | null => {
      // La home è attiva solo sul path esatto, altrimenti qualunque rotta
      // che inizia per "/" la marcherebbe come attiva.
      if (isHomeActive(pathname)) {
        return modules.find(m => m.href === routes.home) ?? null;
      }
      return modules.find(m => m.href !== routes.home && moduleMatchesPath(m, pathname)) ?? null;
    };

    return { ...config, getActiveModule, isHomeActive };
  }, [config]);

  return <EdgConfigContext.Provider value={value}>{children}</EdgConfigContext.Provider>;
};

export default EdgConfigProvider;
