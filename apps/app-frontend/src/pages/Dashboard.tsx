// src/pages/Dashboard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeAppTile, HomeModuleTile, HomeTileGrid, ModuleInfoModal, isModuleUsable } from '@edg/ui';

import { APP_CONFIG, getManifest } from '../config';
import { useMyModules, type MyModule } from '../core/modules';
import { moduleImages } from '../assets/moduli';

/**
 * HOME — pagina di ingresso dopo il login (ADR055, fase 4): il riquadro del
 * frontend, poi uno per ogni modulo restituito da auth-service (propri e in
 * vetrina, già filtrati nel backend).
 *
 * Clic su un riquadro:
 *   - modulo utilizzabile e presente in questo frontend -> si apre
 *   - altrimenti (vetrina, sospeso, scaduto, non ancora qui) -> scheda con
 *     descrizione, stato e contatti EDG
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { modules, loading, error } = useMyModules();
  const [info, setInfo] = useState<MyModule | null>(null);

  const openable = (m: MyModule) => isModuleUsable(m.status) && Boolean(getManifest(m.key));

  const handleClick = (m: MyModule) => {
    const manifest = getManifest(m.key);
    if (manifest && isModuleUsable(m.status)) navigate(manifest.basePath);
    else setInfo(m);
  };

  const openFromInfo = (key: string) => {
    const manifest = getManifest(key);
    setInfo(null);
    if (manifest) navigate(manifest.basePath);
  };

  const empty = !loading && !error && modules.length === 0;

  return (
    <div className='mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center gap-6 px-4 py-8'>
      <HomeTileGrid>
        <li>
          <HomeAppTile />
        </li>
        {modules.map(m => (
          <li key={m.key}>
            <HomeModuleTile
              name={m.name}
              subtitle={m.description}
              version={m.version}
              status={m.status}
              endsAt={m.endsAt}
              branding={m.branding}
              images={moduleImages(m.key)}
              onClick={() => handleClick(m)}
            />
          </li>
        ))}
      </HomeTileGrid>

      {empty && (
        <p className='max-w-xl text-center text-sm text-text-secondary'>
          Non ci sono ancora moduli per la tua azienda. Per scoprire le soluzioni EDG scrivi a{' '}
          <a className='text-text-link' href={`mailto:${APP_CONFIG.CONTACT.email}`}>
            {APP_CONFIG.CONTACT.email}
          </a>
          .
        </p>
      )}
      {error && <p className='text-sm text-text-secondary'>I moduli non sono disponibili in questo momento.</p>}

      <ModuleInfoModal
        module={info}
        onClose={() => setInfo(null)}
        images={info ? moduleImages(info.key) : undefined}
        contact={APP_CONFIG.CONTACT}
        onOpen={info && openable(info) ? openFromInfo : undefined}
      />
    </div>
  );
};

export default Dashboard;
