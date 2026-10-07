// src/core/modules/MyModulesContext.tsx
//
// I moduli dell'utente (GET /auth/me/modules), letti una volta e condivisi da
// home, header (titolo del modulo) e pagine dei moduli. Si rileggono quando
// cambia l'utente o quando cambiano i moduli del JWT (es. al refresh dopo
// un'attivazione o una scadenza).
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@edg/auth';

import { fetchMyModules } from './api';
import type { MyModule } from './types';

interface MyModulesValue {
  modules: MyModule[];
  /** Per chiave, per chi cerca un modulo preciso */
  byKey: ReadonlyMap<string, MyModule>;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const MyModulesContext = createContext<MyModulesValue | null>(null);

export const MyModulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, account, modules: jwtModules } = useAuth();
  const [modules, setModules] = useState<MyModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick(t => t + 1), []);

  // Firma stabile dei moduli del JWT: rilegge solo se cambiano davvero
  const jwtSignature = jwtModules.join(',');

  useEffect(() => {
    if (!isAuthenticated) {
      setModules([]);
      setError(null);
      return;
    }
    let alive = true;
    setLoading(true);
    fetchMyModules()
      .then(list => {
        if (!alive) return;
        setModules(list);
        setError(null);
      })
      .catch(err => {
        if (alive) setError(err instanceof Error ? err.message : 'Moduli non disponibili');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [isAuthenticated, account?.id, jwtSignature, tick]);

  const value = useMemo<MyModulesValue>(
    () => ({ modules, byKey: new Map(modules.map(m => [m.key, m])), loading, error, reload }),
    [modules, loading, error, reload]
  );

  return <MyModulesContext.Provider value={value}>{children}</MyModulesContext.Provider>;
};

export function useMyModules(): MyModulesValue {
  const value = useContext(MyModulesContext);
  if (!value) throw new Error('useMyModules va usato dentro <MyModulesProvider>');
  return value;
}

/** Un modulo dell'utente, se il catalogo lo ha restituito */
export const useMyModule = (key: string): MyModule | undefined => useMyModules().byKey.get(key);
