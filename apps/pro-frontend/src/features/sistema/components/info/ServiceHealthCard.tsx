// src/features/sistema/components/info/ServiceHealthCard.tsx
//
// Card di un singolo servizio nella scheda Salute (ADR038): nome, stato
// (pallino + etichetta), latenza, da quanto dura lo stato attuale ed
// eventuale errore. La barra laterale prende il colore dello stato.
// Un riavvio rilevato nelle ultime 24 ore (ADR042) e' segnalato in giallo:
// il servizio e' operativo, ma qualcosa lo ha fatto ripartire. In fondo la
// build in esecuzione (ADR044): versione, commit e data di build.
import React from 'react';
import { Card, Skeleton } from '@edg/ui';

import { useNow } from '../../../../shared/hooks/useNow';
import { STATUS_STYLE, formatBuild, formatRestart, formatSince } from '../../utils/healthFormat';
import type { ServiceHealth } from '../../types/info';

interface ServiceHealthCardProps {
  service: ServiceHealth;
}

export const ServiceHealthCard: React.FC<ServiceHealthCardProps> = ({ service }) => {
  const now = useNow();
  const style = STATUS_STYLE[service.status];
  const showLatency = service.responseTime !== null && service.status !== 'DOWN';
  const restart = formatRestart(service, now);
  const build = formatBuild(service.build);

  return (
    <Card variant='default' padding='none' className='relative overflow-hidden'>
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${style.solid}`} />
      <div className='flex flex-col gap-1.5 py-3 pl-4 pr-3'>
        <div className='flex items-start justify-between gap-2'>
          <span className='text-sm font-semibold text-text-primary'>{service.name}</span>
          {showLatency && (
            <span className='shrink-0 text-xs tabular-nums text-text-secondary'>{service.responseTime} ms</span>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${style.solid}`} />
          <span className={`text-sm font-medium ${style.text}`}>{style.label}</span>
        </div>

        <span className='text-xs text-text-secondary'>{formatSince(service.since, now)}</span>

        {restart && <span className='text-xs text-text-warning'>{restart}</span>}

        {service.error && service.status !== 'UP' && (
          <span className='truncate font-mono text-xs text-text-danger' title={service.error}>
            {service.error}
          </span>
        )}

        {build && (
          <span className='truncate text-xs tabular-nums text-text-placeholder' title={service.build?.builtAt ?? undefined}>
            {build}
          </span>
        )}
      </div>
    </Card>
  );
};

/** Segnaposto del primo caricamento, stessa altezza della card */
export const ServiceHealthCardSkeleton: React.FC = () => (
  <Card variant='default' padding='md'>
    <Skeleton className='mb-3 h-4 w-28' />
    <Skeleton className='mb-2 h-4 w-20' />
    <Skeleton className='h-3 w-16' />
  </Card>
);

export default ServiceHealthCard;
