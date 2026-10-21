// src/features/sistema/components/tenant/config/index.ts
//
// Registro degli editor di impostazioni per modulo (ADR087): chiave del
// catalogo → definizione. Un modulo nuovo con impostazioni = una voce qui.
import type { ModuleConfigDef } from './types';
import { leggiVigiloConfig, validaVigilo } from './vigiloConfig';
import VigiloConfigEditor from './VigiloConfigEditor';
import VigiloConfigSummary from './VigiloConfigSummary';

export const MODULE_CONFIG: Record<string, ModuleConfigDef> = {
  vigilo: {
    // Nuova attivazione: proposto come preparatore il "Seguito da" del cliente
    initial: (current, ctx) => {
      const c = leggiVigiloConfig(current);
      return { ...c, idOperatore: c.idOperatore ?? ctx.seguitoDa ?? null };
    },
    validate: validaVigilo,
    Summary: VigiloConfigSummary,
    Editor: VigiloConfigEditor,
  },
};

export const moduleConfigDef = (key: string | undefined): ModuleConfigDef | null => (key ? (MODULE_CONFIG[key] ?? null) : null);

export type { ModuleConfig, ModuleConfigContext } from './types';
