// src/features/sistema/components/info/HealthTab.tsx
//
// Scheda "Salute" di SISTEMA → Info (ADR038): solo composizione. I dati
// arrivano dalla pagina (useSystemHealth), che li condivide con i riquadri
// dell'intestazione.
import React from 'react';
import { Button, Card } from '@edg/ui';

import HealthBanner from './HealthBanner';
import ServiceGroup from './ServiceGroup';
import HealthActivity from './HealthActivity';
import LastAlertCard from './LastAlertCard';
import JobsSection from './JobsSection';
import { ServiceHealthCardSkeleton } from './ServiceHealthCard';
import { GROUP_ORDER } from '../../utils/healthFormat';
import type { SystemHealth } from '../../types/info';

interface HealthTabProps {
  data: SystemHealth | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenHistory: () => void;
}

export const HealthTab: React.FC<HealthTabProps> = ({ data, isLoading, error, onRetry, onOpenHistory }) => {
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5'>
        {Array.from({ length: 8 }).map((_, i) => (
          <ServiceHealthCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Errore di lettura: con dati precedenti restano visibili (possono essere vecchi di un giro) */}
      {error && (
        <Card variant='default' padding='md'>
          <div className='flex items-center justify-between gap-3'>
            <p className='text-sm text-text-danger'>
              Impossibile aggiornare lo stato dei servizi: {error}
              {data ? ' — i dati mostrati potrebbero non essere aggiornati.' : ''}
            </p>
            <Button variant='outline' size='sm' onClick={onRetry}>
              Riprova
            </Button>
          </div>
        </Card>
      )}

      {data && (
        <>
          <HealthBanner health={data} />
          {GROUP_ORDER.map(group => (
            <ServiceGroup key={group} group={group} services={data.services.filter(s => s.group === group)} />
          ))}
          <JobsSection jobs={data.jobs ?? []} />
          {/* Attivita', Allarmi e Ultimo allarme sulla stessa riga (impilate sotto lg) */}
          <div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
            <HealthActivity stats={data.stats} />
            <LastAlertCard alert={data.lastAlert} onOpenHistory={onOpenHistory} />
          </div>
        </>
      )}
    </div>
  );
};

export default HealthTab;
