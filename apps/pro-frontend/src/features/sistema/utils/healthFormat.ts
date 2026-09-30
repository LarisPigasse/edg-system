// src/features/sistema/utils/healthFormat.ts
//
// Presentazione degli stati di salute (ADR038): etichette, toni e durate.
// Funzioni pure, nessuna dipendenza da React: unica fonte di verita' per
// come uno stato si mostra, usata da banner, card e riepiloghi.
import type { BuildInfo, HealthGroup, HealthStatus, ServiceHealth, HealthSummary } from '../types/info';

export type HealthTone = 'success' | 'warning' | 'danger' | 'muted';

interface StatusStyle {
  label: string;
  tone: HealthTone;
  /** Colore pieno (pallino e barra laterale della card) */
  solid: string;
  /** Colore del testo di stato */
  text: string;
}

export const STATUS_STYLE: Record<HealthStatus, StatusStyle> = {
  UP:       { label: 'Operativo',         tone: 'success', solid: 'bg-action-success', text: 'text-text-success' },
  DEGRADED: { label: 'Rallentato',        tone: 'warning', solid: 'bg-action-warning', text: 'text-text-warning' },
  DOWN:     { label: 'Non raggiungibile', tone: 'danger',  solid: 'bg-action-danger',  text: 'text-text-danger' },
  UNKNOWN:  { label: 'In verifica',       tone: 'muted',   solid: 'bg-surface-4',      text: 'text-text-secondary' },
};

export const GROUP_LABEL: Record<HealthGroup, string> = {
  gateway: 'Gateway',
  service: 'Microservizi',
  database: 'Database',
};

export const GROUP_ORDER: HealthGroup[] = ['gateway', 'service', 'database'];

// ---------------------------------------------------------------------------
// Durate
// ---------------------------------------------------------------------------

/** Durata compatta: "12 s", "3 min", "2 h 14 min", "3 g 5 h" */
export function formatDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
  const d = Math.floor(h / 24);
  return h % 24 ? `${d} g ${h % 24} h` : `${d} g`;
}

/** "da 2 h 14 min" rispetto a now */
export const formatSince = (iso: string, now: number): string =>
  `da ${formatDuration(now - new Date(iso).getTime())}`;

/** "12 s fa" rispetto a now; "adesso" sotto il secondo */
export function formatAgo(iso: string | null, now: number): string {
  if (!iso) return '—';
  const ms = now - new Date(iso).getTime();
  return ms < 1000 ? 'adesso' : `${formatDuration(ms)} fa`;
}

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// ---------------------------------------------------------------------------
// Stato complessivo (banner)
// ---------------------------------------------------------------------------

export interface OverallHealth {
  tone: HealthTone;
  title: string;
  /** Servizi da evidenziare (DOWN, poi DEGRADED) */
  critical: ServiceHealth[];
}

export function overallHealth(services: ServiceHealth[], summary: HealthSummary): OverallHealth {
  const down = services.filter(s => s.status === 'DOWN');
  const degraded = services.filter(s => s.status === 'DEGRADED');

  if (down.length > 0) {
    return {
      tone: 'danger',
      title: down.length === 1 ? '1 servizio non raggiungibile' : `${down.length} servizi non raggiungibili`,
      critical: [...down, ...degraded],
    };
  }
  if (degraded.length > 0) {
    return {
      tone: 'warning',
      title: degraded.length === 1 ? '1 servizio rallentato' : `${degraded.length} servizi rallentati`,
      critical: degraded,
    };
  }
  if (summary.unknown > 0) {
    return { tone: 'muted', title: 'Verifica dei servizi in corso…', critical: [] };
  }
  return { tone: 'success', title: 'Tutti i servizi sono operativi', critical: [] };
}

/**
 * Riavvio recente da segnalare sulla card, o null. "Riavviato 12 min fa",
 * con il conteggio se nelle ultime 24 ore sono stati piu' d'uno.
 */
export function formatRestart(service: ServiceHealth, now: number): string | null {
  if (!service.lastRestartAt || service.restartsLast24h === 0) return null;
  const ago = formatAgo(service.lastRestartAt, now);
  return service.restartsLast24h > 1
    ? `Riavviato ${ago} (${service.restartsLast24h} volte in 24 h)`
    : `Riavviato ${ago}`;
}

/**
 * Build compatta per la card: "v1.0.0 · abc1234 · 30/09 11:02" (solo le parti
 * note), o null se il servizio non espone nulla.
 */
export function formatBuild(build: BuildInfo | null): string | null {
  if (!build) return null;
  const parts: string[] = [];
  if (build.version) parts.push(`v${build.version}`);
  if (build.commit) parts.push(build.commit);
  if (build.builtAt) {
    const at = new Date(build.builtAt);
    parts.push(
      at.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')
    );
  }
  return parts.length ? parts.join(' · ') : null;
}
