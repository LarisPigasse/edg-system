// src/features/sistema/components/tenant/config/vigiloConfig.ts
//
// Impostazioni di Vigilo all'attivazione per un cliente (ADR084, ADR087):
//   - chi prepara Vigilo: il cliente oppure EDG;
//   - se EDG, l'operatore che se ne occupa (obbligatorio): proposto il
//     "Seguito da" dell'anagrafica collegata al tenant;
//   - i settori suggeriti, che la procedura di avvio preseleziona.
// Si salva in tenant_modules.config: { preparazione, idOperatore, modelli }.
// Editor e riassunto stanno nei loro file (VigiloConfigEditor, VigiloConfigSummary).
import { useEffect, useState } from 'react';

import { vigiloApi, type ModelloLibreria } from '../../../api/vigiloApi';
import type { ModuleConfig } from './types';

export type PreparazioneVigilo = 'cliente' | 'edg';

export interface VigiloConfig {
  preparazione: PreparazioneVigilo;
  idOperatore: number | null;
  modelli: string[];
}

/** Legge una config salvata, con i valori predefiniti per ciò che manca */
export function leggiVigiloConfig(value: ModuleConfig | null | undefined): VigiloConfig {
  const v = (value ?? {}) as Partial<VigiloConfig>;
  return {
    preparazione: v.preparazione === 'edg' ? 'edg' : 'cliente',
    idOperatore: typeof v.idOperatore === 'number' ? v.idOperatore : null,
    modelli: Array.isArray(v.modelli) ? v.modelli.filter((m): m is string => typeof m === 'string') : ['base'],
  };
}

export function validaVigilo(value: ModuleConfig): string | null {
  const c = leggiVigiloConfig(value);
  if (c.preparazione === 'edg' && !c.idOperatore) return 'Scegli l’operatore EDG che prepara Vigilo';
  return null;
}

/** Settori della libreria (caricati una volta per componente) */
export function useModelliLibreria(): ModelloLibreria[] {
  const [modelli, setModelli] = useState<ModelloLibreria[]>([]);
  useEffect(() => {
    let cancelled = false;
    vigiloApi
      .modelli()
      .then(res => {
        if (!cancelled) setModelli(res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setModelli([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return modelli;
}
