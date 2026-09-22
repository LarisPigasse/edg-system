// src/core/components/data/stat-card/StatCard.showcase.tsx
import React from 'react';
import { StatCard } from './StatCard';
import { TitledSurface } from '../../layout';
import { Users, CalendarClock, Truck } from 'lucide-react';

export const StatCardShowcase: React.FC = () => {
  return (
    <div className='space-y-8'>
      {/* KPI semplice */}
      <TitledSurface title='KPI semplice' variant='primary' padding='lg'>
        <div className='space-y-4'>
          <p className='font-medium block text-text-secondary'>La forma base: titolo, valore, icona colorata ed eventuale sottotitolo.</p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <StatCard
              title='Autisti attivi'
              value={24}
              subtitle='su 27 totali'
              icon={<Users className='w-6 h-6 text-white' />}
              color='bg-violet-500 dark:bg-violet-600'
            />
            <StatCard title='Veicoli in flotta' value={18} icon={<Truck className='w-6 h-6 text-white' />} color='bg-sky-500 dark:bg-sky-600' />
          </div>
        </div>
      </TitledSurface>

      {/* Criticità e navigazione */}
      <TitledSurface title='Criticità e navigazione' variant='secondary' padding='lg'>
        <div className='space-y-4'>
          <p className='font-medium block text-text-secondary'>
            "alert" evidenzia la card in rosso; "onClick" la rende cliccabile per navigare al dettaglio.
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <StatCard
              title='Scadenze veicoli'
              value={3}
              subtitle='5 in avvicinamento'
              icon={<CalendarClock className='w-6 h-6 text-white' />}
              color='bg-red-500 dark:bg-red-600'
              alert
              onClick={() => alert('Naviga a /veicoli/scadenze')}
            />
          </div>
        </div>
      </TitledSurface>

      {/* Stato di caricamento */}
      <TitledSurface title='Stato di caricamento' variant='modal' padding='lg'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <StatCard title='Autisti attivi' value={0} icon={<Users className='w-6 h-6 text-white' />} color='bg-violet-500 dark:bg-violet-600' loading />
        </div>
      </TitledSurface>
    </div>
  );
};

export default StatCardShowcase;
