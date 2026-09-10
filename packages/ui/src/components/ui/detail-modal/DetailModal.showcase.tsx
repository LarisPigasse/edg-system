// src/core/components/ui/detail-modal/DetailModal.showcase.tsx
import React, { useState } from 'react';
import DetailModal from './DetailModal';
import { TitledSurface } from '../../layout';
import { Button } from '..';
import Badge from '../badge/Badge';

export const DetailModalShowcase: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='space-y-8'>
      <TitledSurface title='Apri scheda dettaglio' padding='lg'>
        <div className='flex flex-wrap gap-3'>
          <Button variant='primary' onClick={() => setIsOpen(true)}>
            Visualizza anagrafica
          </Button>
        </div>
      </TitledSurface>

      <DetailModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='Cliente Demo'
        onEdit={() => console.log('Apri modifica')}
        sections={[
          {
            fields: [
              { label: 'Tipo', value: 'Cliente' },
              { label: 'Stato', value: <Badge variant='success'>Attivo</Badge> },
            ],
          },
          {
            title: 'Dati fiscali',
            fields: [
              { label: 'Partita IVA', value: '01234567890' },
              { label: 'Codice fiscale', value: '01234567890' },
            ],
          },
          {
            title: 'Indirizzo',
            fields: [
              { label: 'Indirizzo', value: 'Via di Prova, 11' },
              { label: 'CAP', value: '64015' },
              { label: 'Città', value: 'Nereto' },
              { label: 'Sigla provincia', value: 'TE' },
            ],
          },
          {
            title: 'Contatti',
            fields: [
              { label: 'Telefono', value: '0123456789' },
              { label: 'Email', value: 'demo@example.com' },
              { label: 'Referente', value: 'Mario Rossi' },
            ],
          },
          {
            title: 'Note',
            fields: [{ label: 'Note', value: 'Note della azienda Cliente Demo' }],
          },
        ]}
      />
    </div>
  );
};

export default DetailModalShowcase;
