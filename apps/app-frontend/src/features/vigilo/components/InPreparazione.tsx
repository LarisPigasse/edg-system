// src/features/vigilo/components/InPreparazione.tsx
//
// Vigilo non ancora avviato, per chi non lo configura: il marchio del modulo,
// la descrizione e una riga su che cosa sta succedendo. Se Vigilo non
// risponde, l'avviso al posto della riga.
import React from 'react';
import { Alert, ModuleBrand, ScaleToFit } from '@edg/ui';

import { useMyModule } from '../../../core/modules';
import { moduleImages } from '../../../assets/moduli';

export const InPreparazione: React.FC<{ errore?: string | null }> = ({ errore }) => {
  const module = useMyModule('vigilo');
  const name = module?.name ?? 'Vigilo';

  return (
    <div className='mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center'>
      <div className='h-48 w-full max-w-md'>
        <ScaleToFit>
          <ModuleBrand element='logo' name={name} branding={module?.branding} images={moduleImages('vigilo')} />
        </ScaleToFit>
      </div>
      {module?.description && <p className='text-lg text-text-secondary'>{module.description}</p>}
      {errore ? (
        <Alert variant='danger' title='Vigilo non risponde'>
          {errore}
        </Alert>
      ) : (
        <p className='rounded-lg border border-dashed border-surface-border bg-surface-1 px-6 py-4 text-sm text-text-secondary'>
          Vigilo è in preparazione: chi lo configura sta scegliendo i controlli per l'azienda.
        </p>
      )}
    </div>
  );
};
