// src/features/vigilo/pages/VigiloHome.tsx
//
// Home di Vigilo — per ora un segnaposto: logo e descrizione dal catalogo,
// per provare l'intera catena (attivazione -> JWT -> menu -> rotta -> header).
import React from 'react';
import { ModuleBrand, ScaleToFit } from '@edg/ui';

import { useMyModule } from '../../../core/modules';
import { moduleImages } from '../../../assets/moduli';

const VigiloHome: React.FC = () => {
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
      <p className='rounded-xl border border-dashed border-surface-border bg-surface-1 px-6 py-4 text-sm text-text-secondary'>
        Il modulo è in costruzione: qui arriveranno scadenze, manutenzioni e controlli periodici.
      </p>
    </div>
  );
};

export default VigiloHome;
