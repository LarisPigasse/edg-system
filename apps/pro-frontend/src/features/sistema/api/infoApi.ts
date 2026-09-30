// src/features/sistema/api/infoApi.ts
//
// Client della pagina SISTEMA → Info (ADR038) verso log-service tramite il
// gateway. Stesso approccio di logsApi.ts: apiFetch (@edg/auth) per Bearer
// token e refresh automatico. log-service qui risponde con l'inviluppo
// { success, data }, che viene sciolto in questo modulo: i chiamanti
// ricevono direttamente i dati.
import { apiFetch } from '@edg/auth';

import type {
  AlertHistoryEntry,
  AlertHistoryPage,
  AlertHistoryParams,
  AlertRecipient,
  AlertRecipientInput,
  AlertRule,
  AlertRuleInput,
  EventTypeOption,
  SystemHealth,
} from '../types/info';

interface Envelope<T> {
  success: boolean;
  data: T;
}

const unwrap = async <T>(p: Promise<Envelope<T>>): Promise<T> => (await p).data;
const json = (method: string, body?: unknown): RequestInit => ({
  method,
  ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
});

// ---------------------------------------------------------------------------
// Salute
// ---------------------------------------------------------------------------

/** GET /api/system/health — stato gia' calcolato dall'HealthMonitor (aggiornamento automatico) */
export const getSystemHealth = (): Promise<SystemHealth> =>
  unwrap(apiFetch<Envelope<SystemHealth>>('/api/system/health'));

/** POST /api/system/health — esegue subito un giro di controlli (pulsante di aggiornamento) */
export const checkSystemHealthNow = (): Promise<SystemHealth> =>
  unwrap(apiFetch<Envelope<SystemHealth>>('/api/system/health', json('POST')));

// ---------------------------------------------------------------------------
// Regole
// ---------------------------------------------------------------------------
const RULES = '/api/alert/rules';

export const getAlertRules = (): Promise<AlertRule[]> => unwrap(apiFetch<Envelope<AlertRule[]>>(RULES));

export const createAlertRule = (input: AlertRuleInput): Promise<AlertRule> =>
  unwrap(apiFetch<Envelope<AlertRule>>(RULES, json('POST', input)));

export const updateAlertRule = (id: string, input: AlertRuleInput): Promise<AlertRule> =>
  unwrap(apiFetch<Envelope<AlertRule>>(`${RULES}/${id}`, json('PUT', input)));

export const toggleAlertRule = (id: string): Promise<AlertRule> =>
  unwrap(apiFetch<Envelope<AlertRule>>(`${RULES}/${id}/toggle`, json('PATCH')));

export const deleteAlertRule = async (id: string): Promise<void> => {
  await apiFetch(`${RULES}/${id}`, json('DELETE'));
};

// ---------------------------------------------------------------------------
// Destinatari
// ---------------------------------------------------------------------------
const RECIPIENTS = '/api/alert/recipients';

export const getAlertRecipients = (): Promise<AlertRecipient[]> =>
  unwrap(apiFetch<Envelope<AlertRecipient[]>>(RECIPIENTS));

export const createAlertRecipient = (input: AlertRecipientInput): Promise<AlertRecipient> =>
  unwrap(apiFetch<Envelope<AlertRecipient>>(RECIPIENTS, json('POST', input)));

export const updateAlertRecipient = (id: string, input: AlertRecipientInput): Promise<AlertRecipient> =>
  unwrap(apiFetch<Envelope<AlertRecipient>>(`${RECIPIENTS}/${id}`, json('PUT', input)));

export const toggleAlertRecipient = (id: string): Promise<AlertRecipient> =>
  unwrap(apiFetch<Envelope<AlertRecipient>>(`${RECIPIENTS}/${id}/toggle`, json('PATCH')));

export const deleteAlertRecipient = async (id: string): Promise<void> => {
  await apiFetch(`${RECIPIENTS}/${id}`, json('DELETE'));
};

// ---------------------------------------------------------------------------
// Tipi di evento (scelta nella modale delle regole)
// ---------------------------------------------------------------------------
export const getEventTypes = (): Promise<EventTypeOption[]> =>
  unwrap(apiFetch<Envelope<EventTypeOption[]>>('/api/alert/event-types'));

// ---------------------------------------------------------------------------
// Storico degli allarmi
// ---------------------------------------------------------------------------

interface HistoryResponse {
  success: boolean;
  data: AlertHistoryEntry[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

/** GET /api/alert/history — filtri e paginazione lato server */
export async function getAlertHistory(params: AlertHistoryParams): Promise<AlertHistoryPage> {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') qs.set(key, String(value));
  }
  const res = await apiFetch<HistoryResponse>(`/api/alert/history?${qs.toString()}`);
  return {
    items: res.data,
    total: res.pagination.total,
    page: res.pagination.page,
    totalPages: res.pagination.totalPages,
  };
}
