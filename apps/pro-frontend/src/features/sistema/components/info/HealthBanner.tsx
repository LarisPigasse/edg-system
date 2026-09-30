// src/features/sistema/components/info/HealthBanner.tsx
//
// Riepilogo in testa alla scheda Salute (ADR038): stato complessivo della
// piattaforma, servizi in difficolta' con durata, e freschezza del dato
// ("ultimo controllo 12 s fa · ogni 32 s").
import React from 'react';
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from 'lucide-react';

import { useNow } from '../../../../shared/hooks/useNow';
import { STATUS_STYLE, formatAgo, formatSince, overallHealth, type HealthTone } from '../../utils/healthFormat';
import type { SystemHealth } from '../../types/info';

const TONE: Record<HealthTone, { icon: React.ElementType; text: string; bar: string }> = {
  success: { icon: CheckCircle2, text: 'text-text-success', bar: 'bg-action-success' },
  warning: { icon: AlertTriangle, text: 'text-text-warning', bar: 'bg-action-warning' },
  danger: { icon: XCircle, text: 'text-text-danger', bar: 'bg-action-danger' },
  muted: { icon: Loader2, text: 'text-text-secondary', bar: 'bg-surface-4' },
};

interface HealthBannerProps {
  health: SystemHealth;
}

export const HealthBanner: React.FC<HealthBannerProps> = ({ health }) => {
  const now = useNow();
  const overall = overallHealth(health.services, health.summary);
  const tone = TONE[overall.tone];
  const Icon = tone.icon;

  return (
    <div className='relative flex flex-col gap-2 overflow-hidden rounded-lg border border-surface-border bg-surface-2 py-3 pl-5 pr-4 sm:flex-row sm:items-center sm:justify-between'>
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${tone.bar}`} />

      <div className='flex items-start gap-3'>
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone.text} ${overall.tone === 'muted' ? 'animate-spin' : ''}`} />
        <div className='flex flex-col gap-1'>
          <span className={`text-sm font-semibold ${tone.text}`}>{overall.title}</span>
          {overall.critical.map(s => (
            <span key={s.id} className='text-xs text-text-secondary'>
              <span className='font-medium text-text-primary'>{s.name}</span>
              {' · '}
              <span className={STATUS_STYLE[s.status].text}>{STATUS_STYLE[s.status].label.toLowerCase()}</span>{' '}
              {formatSince(s.since, now)}
              {s.error ? ` · ${s.error}` : ''}
            </span>
          ))}
        </div>
      </div>

      <span className='shrink-0 text-xs text-text-secondary sm:text-right'>
        Ultimo controllo {formatAgo(health.monitor.lastRunAt, now)}
        <span className='opacity-70'> · ogni {Math.round(health.monitor.intervalMs / 1000)} s</span>
      </span>
    </div>
  );
};

export default HealthBanner;
