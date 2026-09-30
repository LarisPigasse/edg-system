// src/features/sistema/components/info/HealthActivity.tsx
//
// Statistiche della scheda Salute (ADR038): attivita' dei log nelle ultime
// 24 ore e stato del sistema di allarmi. Un numero che richiede attenzione
// prende il colore di avviso, altrimenti resta neutro.
//
// Restituisce due card affiancabili senza una griglia propria: la
// disposizione (insieme all'ultimo allarme) la decide HealthTab.
import React from 'react';
import { Card } from '@edg/ui';

import type { HealthStats } from '../../types/info';

interface Metric {
  label: string;
  value: number;
  /** Tono quando il valore e' > 0 */
  alertTone?: 'text-text-danger' | 'text-text-warning';
}

const MetricGroup: React.FC<{ title: string; metrics: Metric[] }> = ({ title, metrics }) => (
  <Card variant='default' padding='md' className='flex h-full flex-col gap-3'>
    <h3 className='text-xs font-semibold uppercase tracking-wider text-text-secondary'>{title}</h3>
    <dl className='grid grid-cols-3 gap-3'>
      {metrics.map(m => (
        <div key={m.label} className='flex flex-col gap-0.5'>
          <dd
            className={`text-2xl font-semibold tabular-nums ${
              m.alertTone && m.value > 0 ? m.alertTone : 'text-text-primary'
            }`}
          >
            {m.value.toLocaleString('it-IT')}
          </dd>
          <dt className='text-xs text-text-secondary'>{m.label}</dt>
        </div>
      ))}
    </dl>
  </Card>
);

interface HealthActivityProps {
  stats: HealthStats;
}

export const HealthActivity: React.FC<HealthActivityProps> = ({ stats }) => (
  <>
    <MetricGroup
      title='Attività ultime 24 ore'
      metrics={[
        { label: 'Eventi registrati', value: stats.logs24h },
        { label: 'Errori', value: stats.errori24h, alertTone: 'text-text-warning' },
        { label: 'Critici', value: stats.critici24h, alertTone: 'text-text-danger' },
      ]}
    />
    <MetricGroup
      title='Allarmi'
      metrics={[
        { label: 'Regole attive', value: stats.alertRules },
        { label: 'Inviati in 7 giorni', value: stats.alertsWeek },
        { label: 'Invii falliti in 7 giorni', value: stats.alertsFailed, alertTone: 'text-text-danger' },
      ]}
    />
  </>
);

export default HealthActivity;
