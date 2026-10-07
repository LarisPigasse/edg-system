// src/features/sistema/types/modules.ts
//
// Gestione moduli (ADR047-048): catalogo (root) e attivazioni per tenant
// (admin e root). Specchio delle risposte di auth-service:
//   /auth/modules                       catalogo
//   /auth/tenants/:tenantId/modules     attivazioni di un tenant
import type { ModuleBranding } from '@edg/ui';

/** Stato di un modulo nel catalogo */
export type ModuleStatus = 'sviluppo' | 'disponibile' | 'dismesso';

export interface CatalogModule {
  id: number;
  /** Chiave stabile: si sceglie alla creazione e non cambia più */
  key: string;
  name: string;
  description: string | null;
  /** Prodotto di appartenenza (raggruppa menu e branding) */
  product: string;
  /** Chiavi dei moduli richiesti */
  dependencies: string[];
  status: ModuleStatus;
  /** In vetrina (ADR056): chi non lo ha lo vede spento; vale solo se disponibile */
  showcase: boolean;
  /** Durata predefinita della prova, in giorni */
  trialDays: number;
  /** Versione mostrata ai clienti, major.minor.patch (ADR057) */
  version: string;
  /** Identità visiva: icona, logo e titolo (ADR054); null = testi predefiniti */
  branding: ModuleBranding | null;
  /** Attivazioni di qualunque stato (solo dalle letture del catalogo) */
  activationCount?: number;
  createdAt: string;
  updatedAt: string;
}

/** Corpo di creazione/modifica del catalogo (la chiave solo in creazione) */
export interface CatalogModuleInput {
  key?: string;
  name: string;
  description: string | null;
  product: string;
  dependencies: string[];
  status: ModuleStatus;
  showcase: boolean;
  trialDays: number;
  version: string;
  /** Solo dalla finestra Aspetto; in creazione assente = testi predefiniti */
  branding?: ModuleBranding | null;
}

/** Stato di un'attivazione ('scaduto' lo decide solo il processo di scadenza) */
export type ActivationStatus = 'prova' | 'attivo' | 'sospeso' | 'scaduto';

export interface Activation {
  id: number;
  tenantId: number;
  module: string;
  status: ActivationStatus;
  startsAt: string;
  endsAt: string | null;
  /** Quando è passata a scaduto: da qui il conto per l'eliminazione dei dati */
  expiredAt: string | null;
  config: Record<string, unknown> | null;
  notes: string | null;
  grantedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Un modulo del catalogo visto da un tenant */
export interface TenantModuleView {
  module: CatalogModule;
  activation: Activation | null;
  /** In vigore adesso (stato, periodo e dipendenze) */
  inForce: boolean;
  /** Se scaduto: data di eliminazione automatica dei dati */
  purgeAt: string | null;
}

export interface TenantModules {
  tenant: {
    id: number;
    name: string;
    slug: string;
    /** Cliente dell'anagrafica EDG collegato: da lui il settore (ADR059) */
    clienteUuid: string | null;
    isSystem: boolean;
    isActive: boolean;
    /** Tenant di sistema: tutti i moduli, sempre (dal codice) */
    allModules: boolean;
  };
  modules: TenantModuleView[];
}

export interface ActivationCreateInput {
  module: string;
  status: 'prova' | 'attivo';
  startsAt?: string;
  endsAt?: string | null;
  notes?: string | null;
}

export interface ActivationUpdateInput {
  status?: 'prova' | 'attivo' | 'sospeso';
  startsAt?: string;
  endsAt?: string | null;
  notes?: string | null;
}

/** Esito di una modifica: i moduli caduti per dipendenza (es. sospendo spedizioni → cade tracking) */
export interface ActivationUpdateResult {
  activation: Activation;
  lostModules: string[];
}
