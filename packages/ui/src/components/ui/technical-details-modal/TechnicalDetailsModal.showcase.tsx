// src/core/components/ui/technical-details-modal/TechnicalDetailsModal.showcase.tsx
import React, { useState } from 'react';
import TechnicalDetailsModal from './TechnicalDetailsModal';
import { TitledSurface } from '../../layout';
import { Button } from '..';

export const TechnicalDetailsModalShowcase: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='space-y-8'>
      <TitledSurface title='Apri dati tecnici' padding='lg'>
        <div className='flex flex-wrap gap-3'>
          <Button variant='outline' onClick={() => setIsOpen(true)}>
            Visualizza dati tecnici
          </Button>
        </div>
      </TitledSurface>

      <TechnicalDetailsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        record={{
          idReparto: 4,
          uuidReparto: '3f2a1c9e-6b7d-4e21-9a3f-1c9e6b7d8b1d',
          reparto: 'Vendite',
          isActive: true,
          createdAt: '2026-09-08T10:12:00.000Z',
          updatedAt: '2026-09-08T10:12:00.000Z',
        }}
      />
    </div>
  );
};

export default TechnicalDetailsModalShowcase;
