// src/core/components/data/stat-tile/StatTile.showcase.tsx
import React from 'react';
import { StatTile } from './StatTile';
import { TitledSurface } from '../../layout';

export const StatTileShowcase: React.FC = () => {
  return (
    <div className='space-y-8'>
      {/* Tonalità */}
      <TitledSurface title='Tonalità' variant='primary' padding='lg'>
        <div className='space-y-4'>
          <p className='font-medium block text-text-secondary'>
            Il colore del numero comunica lo stato del dato — di norma "default", con le altre tonalità riservate a evidenziare un
            conteggio critico.
          </p>
          <div className='flex flex-wrap gap-4'>
            <StatTile value={128} label='Totale' />
            <StatTile value={96} label='Attivi' tone='success' />
            <StatTile value={4} label='Bloccati' tone='danger' />
            <StatTile value={2} label='In scadenza' tone='warning' />
          </div>
        </div>
      </TitledSurface>

      {/* Stato di caricamento */}
      <TitledSurface title='Stato di caricamento' variant='secondary' padding='lg'>
        <div className='space-y-4'>
          <p className='font-medium block text-text-secondary'>Skeleton mostrato mentre il dato non è ancora disponibile.</p>
          <div className='flex flex-wrap gap-4'>
            <StatTile value={0} label='Totale' loading />
            <StatTile value={0} label='Attivi' loading />
          </div>
        </div>
      </TitledSurface>

      {/* Esempio realistico */}
      <TitledSurface title='Esempio realistico' variant='modal' padding='lg'>
        <p className='font-medium mb-4 block text-text-secondary'>
          Uso tipico nello slot "actions" di PageHeader — sempre prima del pulsante di refresh.
        </p>
        <div className='flex flex-wrap items-center gap-3'>
          <StatTile value={342} label='Totale' />
          <StatTile value={310} label='Attivi' tone='success' />
          <StatTile value={28} label='Non attivi' />
          <StatTile value={4} label='Bloccati' tone='danger' />
        </div>
      </TitledSurface>
    </div>
  );
};

export default StatTileShowcase;
