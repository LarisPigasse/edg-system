// src/features/vigilo/pages/VigiloHome.tsx
//
// Home di Vigilo. Finché la procedura di avvio non è fatta: chi configura ci
// viene portato, gli altri leggono che Vigilo è in preparazione (con il
// marchio del modulo). Dopo: la dashboard.
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, ModuleBrand, ScaleToFit, Spinner } from '@edg/ui';

import { useMyModule } from '../../../core/modules';
import { moduleImages } from '../../../assets/moduli';
import { useProfiloVigilo } from '../hooks/useProfiloVigilo';
import { Dashboard } from '../components/dashboard/Dashboard';

const Riquadro: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className='rounded-lg border border-dashed border-surface-border bg-surface-1 px-6 py-4 text-sm text-text-secondary'>{children}</p>
);

const VigiloHome: React.FC = () => {
  const module = useMyModule('vigilo');
  const { profilo, errore, caricamento } = useProfiloVigilo();
  const name = module?.name ?? 'Vigilo';

  if (caricamento) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <Spinner size='md' />
      </div>
    );
  }
  if (profilo && !profilo.avviatoIl && profilo.capacita.config) return <Navigate to='avvio' replace />;
  if (profilo?.avviatoIl) return <Dashboard profilo={profilo} />;

  return (
    <div className='mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center'>
      <div className='h-48 w-full max-w-md'>
        <ScaleToFit>
          <ModuleBrand element='logo' name={name} branding={module?.branding} images={moduleImages('vigilo')} />
        </ScaleToFit>
      </div>
      {module?.description && <p className='text-lg text-text-secondary'>{module.description}</p>}
      {errore && (
        <Alert variant='danger' title='Vigilo non risponde'>
          {errore}
        </Alert>
      )}
      {profilo && !profilo.avviatoIl && (
        <Riquadro>Vigilo è in preparazione: chi lo configura sta scegliendo i controlli per l'azienda.</Riquadro>
      )}
    </div>
  );
};

export default VigiloHome;
