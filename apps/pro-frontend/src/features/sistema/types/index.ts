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

// ─── Log azioni (log-service) ──────────────────────────────────────────────

/**
 * Log azioni (audit trail) esposti da log-service tramite il gateway su
 * /api/log/*. A differenza delle risorse sopra, log-service non usa
 * l'inviluppo { success, data } di auth-service: risponde con il body
 * "nudo" (vedi logController.ts) — per questo logsApi.ts non passa dalla
 * fabbrica generica createResourceApi ma chiama apiFetch direttamente,
 * stesso schema già usato per le chiamate non-CRUD di questa feature (vedi
 * accountActions.ts, loadStats in AccountPage.tsx).
 *
 * I tipi qui sotto non replicano l'intera gerarchia di eventCategories.ts
 * lato backend (metadata specifici per categoria, sottocategorie tipizzate
 * a enum): la pagina Logs è di sola consultazione, la metadata viene
 * mostrata come coppie chiave/valore generiche, non validata — i log li
 * scrivono i servizi via POST /azione (apiKeyAuth), non il frontend.
 */

export const EVENT_CATEGORY_OPTIONS = [
  { value: 'AUTH', label: 'Autenticazione' },
  { value: 'DATA', label: 'Dati' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'SYSTEM', label: 'Sistema' },
  { value: 'AUDIT', label: 'Audit' },
  { value: 'SECURITY', label: 'Sicurezza' },
] as const;

export type EventCategory = (typeof EVENT_CATEGORY_OPTIONS)[number]['value'];

export const EVENT_SEVERITY_OPTIONS = [
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Attenzione' },
  { value: 'error', label: 'Errore' },
  { value: 'critical', label: 'Critico' },
] as const;

export type EventSeverity = (typeof EVENT_SEVERITY_OPTIONS)[number]['value'];

export const LOG_OUTCOME_OPTIONS = [
  { value: 'successo', label: 'Successo' },
  { value: 'fallito', label: 'Fallito' },
  { value: 'parziale', label: 'Parziale' },
] as const;

export type LogOutcome = (typeof LOG_OUTCOME_OPTIONS)[number]['value'];

/**
 * Un evento di audit trail (collection MongoDB `azionelogs`). Mongoose non
 * espone un virtual `id` nel JSON di risposta di log-service (nessun
 * `toJSON: { virtuals: true }` sullo schema): la chiave è `_id`, non `id`
 * come nelle risorse di auth-service viste sopra.
 */
export interface AzioneLog {
  _id: string;
  timestamp: string;
  categoria?: EventCategory;
  sottoCategoria?: string;
  criticita?: EventSeverity;
  metadata?: Record<string, unknown>;
  origine: {
    tipo: 'utente' | 'sistema';
    id: string;
    /** Solo per i log scritti dopo l'arricchimento dei logger di
     * auth/system/vehicle-service (2026-09-24): email e tenantId
     * dell'account che ha generato l'evento. I log precedenti hanno
     * dettagli vuoto o con la sola chiave legacy `identifier`. */
    dettagli: { email?: string; tenantId?: number } & Record<string, unknown>;
  };
  azione: {
    tipo: 'create' | 'update' | 'delete' | 'custom';
    entita: string;
    idEntita: string;
    operazione: string;
    dettagli: Record<string, unknown>;
  };
  risultato: {
    esito: LogOutcome;
    messaggio?: string;
  };
  contesto: {
    transazioneId?: string;
    causalita?: string[];
    sessione?: string;
    ip?: string;
    userAgent?: string;
    ambiente: string;
  };
  stato: {
    precedente: Record<string, unknown> | null;
    nuovo: Record<string, unknown> | null;
    diff: Record<string, unknown> | null;
  };
  tags: string[];
}

/** Filtri per GET /api/log/azioni — vedi buildQuery in logController.ts. */
export interface LogSearchParams {
  categoria?: EventCategory;
  criticita?: EventSeverity;
  userId?: string;
  tenantId?: number | string;
  entita?: string;
  esito?: LogOutcome;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/** Risposta di GET /api/log/azioni — paginazione server-side, non client-side. */
export interface LogSearchResult {
  logs: AzioneLog[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Risposta di GET /api/log/statistiche. */
export interface LogStatistiche {
  total: number;
  byCategory: Record<EventCategory, number>;
  /**
   * ⚠️ Le chiavi sono in maiuscolo (INFO/WARNING/ERROR/CRITICAL) ma il
   * campo `criticita` sui documenti è salvato in minuscolo (vedi
   * EventSeverity sopra): il group-by di getStatistiche in
   * logController.ts confronta l'esito dell'aggregazione (minuscolo) con
   * queste chiavi (maiuscolo) e non trova mai corrispondenza — bySeverity
   * risulta quindi sempre a zero per gli eventi con criticita valorizzata.
   * Bug lato log-service, non qualcosa che il frontend possa aggirare da
   * solo: da correggere lì (un cambio di una riga) prima di fidarsi di
   * questi numeri in un tile statistiche.
   */
  bySeverity: Record<'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL', number>;
  byOutcome: Record<LogOutcome, number>;
  criticalEvents: number;
  lastHourEvents: number;
  successRate: {
    overall: number;
    last30Days: number;
    trend: number;
  };
}
