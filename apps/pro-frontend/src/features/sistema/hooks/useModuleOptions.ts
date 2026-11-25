// src/features/sistema/hooks/useModuleOptions.ts — moduli per il filtro dei log
//
// Le scelte del filtro Modulo di SISTEMA › Logs: "Piattaforma" (eventi senza
// modulo: autenticazione, sistema, email, backup…) e i moduli del catalogo
// (ADR048), così un modulo nuovo compare da solo. Se il catalogo non si
// carica resta solo "Piattaforma": il filtro non deve impedire di leggere i log.
import { useEffect, useMemo, useState } from 'react';
import type { SelectOption } from '@edg/ui';

import { listCatalog } from '../api/moduleApi';
import type { CatalogModule } from '../types/modules';

/** Valore del filtro per gli eventi senza modulo (lo stesso di log-service, config/moduli.ts) */
export const MODULO_PIATTAFORMA = 'piattaforma';

export function useModuleOptions(): { options: SelectOption[]; getModuleName: (key: string | null | undefined) => string } {
  const [catalogo, setCatalogo] = useState<CatalogModule[]>([]);

  useEffect(() => {
    let vivo = true;
    listCatalog()
      .then(items => vivo && setCatalogo(items))
      .catch(() => vivo && setCatalogo([]));
    return () => {
      vivo = false;
    };
  }, []);

  return useMemo(() => {
    const nomi = new Map(catalogo.map(m => [m.key, m.name]));
    return {
      options: [
        { value: MODULO_PIATTAFORMA, label: 'Piattaforma' },
        ...[...catalogo].sort((a, b) => a.name.localeCompare(b.name, 'it')).map(m => ({ value: m.key, label: m.name })),
      ],
      getModuleName: key => (key ? (nomi.get(key) ?? key) : 'Piattaforma'),
    };
  }, [catalogo]);
}
