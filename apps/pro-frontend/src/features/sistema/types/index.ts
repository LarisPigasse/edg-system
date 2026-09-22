// src/features/sistema/types/index.ts

/**
 * Tipi condivisi con auth-service (packages/auth in edg-docker) per le
 * tabelle di sistema gestibili solo da root: Tenant, e in seguito Account e
 * Ruoli/Permessi (ADR024).
 */

// ─── Tenant (tabella più primitiva: da questa dipendono account e moduli) ──

export const TENANT_LOCALE_OPTIONS = [
  { value: 'it', label: 'Italiano' },
  { value: 'en', label: 'English' },
] as const;

export interface Tenant {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  defaultLocale: string;
  isActive: boolean;
  /** true per il tenant di sistema (Express Delivery Group): protetto da
   * eliminazione e disattivazione lato backend, non esposto in scrittura. */
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantInput {
  name: string;
  slug: string;
  defaultLocale?: string;
  isActive?: boolean;
}

// ─── Account ────────────────────────────────────────────────────────────────

export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'operatore', label: 'Operatore' },
  { value: 'cliente', label: 'Cliente' },
] as const;

/**
 * Ruoli non assegnabili per certi accountType — mirror della stessa regola
 * applicata (e imposta) lato backend, vedi AccountController.ts. Qui serve
 * solo per non proporre nel form una combinazione che il backend
 * respingerebbe comunque; l'enforcement reale resta server-side.
 */
export const ROLE_ACCOUNT_TYPE_RESTRICTIONS: Record<string, string[]> = {
  root: ['cliente'],
};

/**
 * Ruoli il cui account deve appartenere al tenant di sistema — mirror della
 * stessa regola imposta lato backend (vedi AccountController.ts). Qui serve
 * solo a filtrare le opzioni proposte nel form; l'enforcement reale resta
 * server-side.
 */
export const ROLES_REQUIRING_SYSTEM_TENANT: string[] = ['root'];

export interface AccountRole {
  id: number;
  name: string;
}

export interface AccountTenant {
  id: number;
  name: string;
  slug: string;
}

export interface Account {
  id: number;
  uuid: string;
  email: string;
  accountType: string;
  entityId: string | null;
  tenantId: number | null;
  roleId: number;
  role?: AccountRole;
  tenant?: AccountTenant;
  isActive: boolean;
  isVerified: boolean;
  lastLogin: string | null;
  blockedUntil: string | null;
  blockReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountInput {
  email: string;
  /** Presente solo in creazione, o in modifica quando root sceglie di reimpostarla. */
  password?: string;
  roleId: number;
  tenantId: number;
  accountType: string;
  entityId?: string | null;
}

// ─── Sessioni ───────────────────────────────────────────────────────────────

/** Struttura restituita da GET /auth/sessions — vedi SessionController. */
export interface Session {
  id: number;
  user: {
    id: number;
    email: string;
    role: string;
  };
  device: {
    ip: string | null;
    device: string | null;
    os: string | null;
    browser: string | null;
  };
  geo: {
    country: string | null;
    region: string | null;
    city: string | null;
    timezone: string | null;
  };
  createdAt: string;
  lastActivityAt: string | null;
  expiresAt: string;
}

// ─── Ruoli / Permessi (ADR024) ──────────────────────────────────────────────

/** Una riga della tabella role_permissions: una stringa permesso per riga. */
export interface RolePermissionRow {
  permission: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  /** true per i 4 ruoli seedati (root/admin/operatore/guest): qui serve solo
   * a distinguerli visivamente, la vera restrizione (permessi non
   * modificabili) si applica al solo ruolo 'root', vedi RuoliPage. */
  isSystem: boolean;
  permissions: RolePermissionRow[];
}

/** Estrae l'elenco piatto delle stringhe permesso da un ruolo. */
export function rolePermissionStrings(role: Role): string[] {
  return role.permissions.map(p => p.permission);
}
