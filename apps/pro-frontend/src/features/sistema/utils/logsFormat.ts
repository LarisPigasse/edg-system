// src/features/sistema/utils/logsFormat.ts

/**
 * Helper di formattazione per la pagina Logs: solo trasformazioni pure,
 * nessuno stato e nessun JSX. Condivisi da LogFilters, LogDetailModal e
 * dalle colonne di LogsPage — per un helper usato da un solo file la
 * convenzione qui è tenerlo locale (vedi formatDateTime in
 * SessioniPage.tsx), ma qui serve in più punti.
 */
import type { BadgeVariant } from '@edg/ui';

import { EVENT_CATEGORY_OPTIONS, EVENT_SEVERITY_OPTIONS, LOG_OUTCOME_OPTIONS } from '../types';
import type { AzioneLog, EventCategory, EventSeverity, LogOutcome } from '../types';

export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '—';
  return new Date(value).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'medium' });
};

export const categoriaLabel = (categoria?: EventCategory | string): string =>
  EVENT_CATEGORY_OPTIONS.find(o => o.value === categoria)?.label ?? categoria ?? '—';

export const severityLabel = (criticita?: EventSeverity | string): string =>
  EVENT_SEVERITY_OPTIONS.find(o => o.value === criticita)?.label ?? criticita ?? '—';

export const esitoLabel = (esito: LogOutcome | string): string =>
  LOG_OUTCOME_OPTIONS.find(o => o.value === esito)?.label ?? esito;

/**
 * Badge non ha una variante "critical" dedicata (solo primary/success/
 * warning/danger/info/default): error e critical condividono 'danger', la
 * label del badge resta comunque distinta (vedi severityLabel).
 */
export const severityBadgeVariant = (criticita?: EventSeverity | string): BadgeVariant => {
  switch (criticita) {
    case 'warning':
      return 'warning';
    case 'error':
    case 'critical':
      return 'danger';
    default:
      return 'info';
  }
};

export const esitoBadgeVariant = (esito: LogOutcome | string): BadgeVariant => {
  switch (esito) {
    case 'successo':
      return 'success';
    case 'fallito':
      return 'danger';
    default:
      return 'warning';
  }
};

/** Pretty-print per i blocchi JSON del dettaglio (metadata, stato.*) — '—' se vuoto o nullo. */
export const formatJson = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object' && Object.keys(value as object).length === 0) return '—';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

/**
 * Email dell'attore che ha generato l'evento — presente solo sui log scritti
 * dopo l'arricchimento dei logger di auth/system/vehicle-service (vedi
 * types/index.ts). undefined sui log precedenti e sugli eventi 'sistema'.
 */
export const originEmail = (log: Pick<AzioneLog, 'origine'>): string | undefined => log.origine.dettagli?.email;

/** ID del tenant a cui è collegato l'account che ha generato l'evento, se presente. */
export const originTenantId = (log: Pick<AzioneLog, 'origine'>): number | undefined => log.origine.dettagli?.tenantId;

/**
 * ID numerico dell'account che ha generato l'evento — solo per origine.tipo
 * 'utente' (per gli eventi 'sistema' origine.id è il nome del servizio, non
 * un ID account, quindi non ha senso cercarlo tra gli account). undefined
 * anche se origine.id non è un numero valido (log molto vecchi, formati
 * legacy).
 */
export const originAccountId = (log: Pick<AzioneLog, 'origine'>): number | undefined => {
  if (log.origine.tipo !== 'utente') return undefined;
  const id = Number(log.origine.id);
  return Number.isFinite(id) ? id : undefined;
};
