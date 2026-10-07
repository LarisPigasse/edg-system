// src/features/sistema/types/info.ts
//
// Tipi della pagina SISTEMA → Info (ADR038). Rispecchiano la risposta di
// log-service GET /api/system/health (controllers/systemController.ts +
// services/health/HealthMonitor.ts).

export type HealthStatus = 'UNKNOWN' | 'UP' | 'DEGRADED' | 'DOWN';
export type HealthGroup = 'gateway' | 'service' | 'database';

/** Identita' della build di un servizio (ADR044) */
export interface BuildInfo {
  version: string | null;
  /** ISO — quando e' stata costruita l'immagine */
  builtAt: string | null;
  commit: string | null;
}

export interface ServiceHealth {
  id: string;
  name: string;
  group: HealthGroup;
  status: HealthStatus;
  /** ISO — da quando il servizio e' nello stato attuale */
  since: string;
  checkedAt: string | null;
  responseTime: number | null;
  error: string | null;
  consecutiveFailures: number;
  /** ISO — avvio del processo (null se il servizio non espone l'uptime) */
  startedAt: string | null;
  /** ISO — ultimo riavvio rilevato dal monitor */
  lastRestartAt: string | null;
  /** Riavvii rilevati nelle ultime 24 ore */
  restartsLast24h: number;
  /** Build in esecuzione (null se il servizio non la espone) */
  build: BuildInfo | null;
}

export interface HealthSummary {
  total: number;
  up: number;
  degraded: number;
  down: number;
  unknown: number;
}

export interface HealthStats {
  logs24h: number;
  critici24h: number;
  errori24h: number;
  alertRules: number;
  alertsWeek: number;
  /** Invii falliti negli ultimi 7 giorni */
  alertsFailed: number;
}

export interface AlertHistoryEntry {
  _id: string;
  ruleId: string;
  ruleName: string;
  triggeringEventId: string;
  sentTo: string;
  recipients: string[];
  status: 'SENT' | 'FAILED';
  error: string | null;
  groupKey: string;
  matchCount: number;
  severity: 'info' | 'warning' | 'critical' | null;
  createdAt: string;
}

/** Stato di un processo pianificato atteso (ADR039) — log-service services/jobs/JobMonitor.ts */
export type JobStatus = 'OK' | 'FAILED' | 'LATE' | 'PENDING';

export interface JobState {
  id: string;
  name: string;
  service: string;
  schedule: string;
  /** Intervallo atteso tra due esecuzioni riuscite e tolleranza, in ms */
  everyMs: number;
  graceMs: number;
  status: JobStatus;
  lastRunAt: string | null;
  lastOutcome: 'completed' | 'failed' | null;
  lastDurationMs: number | null;
  lastSummary: string | null;
  lastError: string | null;
  lastCompletedAt: string | null;
  dueBy: string | null;
}

/** Parametri reali del monitor di log-service (letti dalla scheda Guida) */
export interface HealthMonitorParams {
  lastRunAt: string | null;
  /** Intervallo tra due giri di controlli */
  intervalMs: number;
  /** Controlli falliti consecutivi prima di "Non raggiungibile" */
  downAfterFailures: number;
  /** Oltre questa latenza il servizio è "Rallentato" */
  degradedLatencyMs: number;
  /** Attesa massima di ogni singolo controllo */
  probeTimeoutMs: number;
  /** Pausa minima tra due giri richiesti a mano */
  manualCheckMinGapMs: number;
  /** Finestra in cui si contano i riavvii */
  restartWindowMs: number;
  /** Dopo l'avvio di log-service, per quanto i ritardi dei processi non generano allarmi */
  jobsStartupGraceMs: number;
}

export interface SystemHealth {
  services: ServiceHealth[];
  jobs: JobState[];
  summary: HealthSummary;
  stats: HealthStats;
  lastAlert: AlertHistoryEntry | null;
  monitor: HealthMonitorParams;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Regole, destinatari e tipi di evento (scheda Regole — ADR038, fase 4a)
// ---------------------------------------------------------------------------

export type AlertGroupBy = 'service' | 'actor' | 'ip';
export type AlertEsito = 'successo' | 'fallito' | 'parziale';

export interface AlertConditions {
  categoria: string | null;
  sottoCategoria: string | null;
  criticita: string | null;
  esito: AlertEsito | null;
  origineId: string | null;
}

/** Gravita' di un allarme (i tre livelli dell'email) */
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertRule {
  _id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  conditions: AlertConditions;
  threshold: { count: number; windowMinutes: number };
  groupBy: AlertGroupBy | null;
  recipientIds: string[];
  cooldownMinutes: number;
  /** Gravita' fissa della notifica; null = ricavata dall'evento */
  severity: AlertSeverity | null;
  /** Valorizzato solo per le regole predefinite (non eliminabili) */
  systemKey: string | null;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Corpo di creazione/modifica: niente systemKey ne' lastTriggeredAt (non modificabili) */
export type AlertRuleInput = Pick<
  AlertRule,
  | 'name'
  | 'description'
  | 'enabled'
  | 'conditions'
  | 'threshold'
  | 'groupBy'
  | 'recipientIds'
  | 'cooldownMinutes'
  | 'severity'
>;

export interface AlertRecipient {
  _id: string;
  name: string;
  email: string;
  enabled: boolean;
  isDefault: boolean;
  /** Numero di regole che lo indicano esplicitamente */
  rulesCount: number;
  createdAt: string;
  updatedAt: string;
}

export type AlertRecipientInput = Pick<AlertRecipient, 'name' | 'email' | 'enabled' | 'isDefault'>;

export interface EventTypeOption {
  value: string;
  label: string | null;
  seen: boolean;
}

// ---------------------------------------------------------------------------
// Storico degli allarmi (scheda Storico — ADR038, fase 4b)
// ---------------------------------------------------------------------------

export interface AlertHistoryParams {
  ruleId?: string;
  status?: 'SENT' | 'FAILED';
  severity?: 'info' | 'warning' | 'critical';
  /** ISO */
  startDate?: string;
  /** ISO */
  endDate?: string;
  page: number;
  limit: number;
}

export interface AlertHistoryPage {
  items: AlertHistoryEntry[];
  total: number;
  page: number;
  totalPages: number;
}
