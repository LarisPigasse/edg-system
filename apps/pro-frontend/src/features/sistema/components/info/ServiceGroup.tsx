// src/features/sistema/components/info/ServiceGroup.tsx
//
// Sezione di servizi dello stesso gruppo (Gateway, Microservizi, Database)
// con intestazione e conteggio dei servizi operativi del gruppo.
import React from 'react';

import ServiceHealthCard from './ServiceHealthCard';
import { GROUP_LABEL } from '../../utils/healthFormat';
import type { HealthGroup, ServiceHealth } from '../../types/info';

interface ServiceGroupProps {
  group: HealthGroup;
  services: ServiceHealth[];
}

export const ServiceGroup: React.FC<ServiceGroupProps> = ({ group, services }) => {
  if (services.length === 0) return null;
  const up = services.filter(s => s.status === 'UP').length;

  return (
    <section className='flex flex-col gap-2'>
      <header className='flex items-baseline gap-2'>
        <h3 className='text-xs font-semibold uppercase tracking-wider text-text-secondary'>{GROUP_LABEL[group]}</h3>
        <span className='text-xs tabular-nums text-text-secondary'>
          {up}/{services.length}
        </span>
      </header>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6'>
        {services.map(s => (
          <ServiceHealthCard key={s.id} service={s} />
        ))}
      </div>
    </section>
  );
};

export default ServiceGroup;
