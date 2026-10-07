// src/pages/Dashboard.tsx
import React from 'react';
import { HomeAppTile, HomeTileGrid } from '@edg/ui';
import { useAuth } from '@edg/auth';

// Import diretto (non dall'indice della feature): l'indice porta con sé
// tutte le pagine di sistema, che invece si caricano a richiesta
import ModulesTile from '../features/sistema/components/ModulesTile';

/**
 * HOME — pagina di ingresso dopo il login (ADR055): grandi riquadri, il primo
 * con nome e sottotitolo del frontend, poi uno per modulo con il suo logo.
 * I moduli li vede chi li gestisce (sistema.moduli).
 */
const Dashboard: React.FC = () => {
  const { hasPermission } = useAuth();

  return (
    <div className='mx-auto flex min-h-[50vh] max-w-7xl items-center px-4 py-8'>
      <HomeTileGrid>
        <li>
          <HomeAppTile />
        </li>
        {hasPermission('sistema.moduli') && <ModulesTile />}
      </HomeTileGrid>
    </div>
  );
};

export default Dashboard;
