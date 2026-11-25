// src/features/sistema/components/module-data/registry.ts
//
// Moduli che espongono il contratto "dati del tenant" (fase 3, ADR117): un
// riepilogo e l'eliminazione ("tutto" o "solo i dati"). Un modulo nuovo con
// dati = una riga qui, con il percorso delle sue rotte di piattaforma.

export interface ModuleDatiDef {
  /** Percorso del riepilogo e dell'eliminazione per un tenant */
  percorso: (idTenant: number) => string;
}

export const MODULE_DATI: Record<string, ModuleDatiDef> = {
  vigilo: { percorso: idTenant => `/api/vigilo/piattaforma/tenant/${idTenant}/dati` },
};

export const moduleDatiDef = (key: string | undefined): ModuleDatiDef | null => (key ? (MODULE_DATI[key] ?? null) : null);
