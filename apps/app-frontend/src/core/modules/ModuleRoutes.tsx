// src/core/modules/ModuleRoutes.tsx
//
// Le pagine di un modulo, montate sotto `${basePath}/*`. Chi non può aprire il
// modulo (non in vigore o senza permessi) torna alla home, dove il riquadro
// spiega perché; una pagina con un permesso che manca fa lo stesso. Un percorso
// sconosciuto dentro il modulo riporta alla sua home.
import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@edg/auth';

import { canOpenModule } from './access';
import type { AppModuleManifest } from './types';

const ModuleRoutes: React.FC<{ manifest: AppModuleManifest; homePath?: string }> = ({ manifest, homePath = '/' }) => {
  const { hasModule, hasPermission, permissions } = useAuth();

  if (!canOpenModule(manifest.key, { hasModule, permissions })) {
    return <Navigate to={homePath} replace />;
  }

  return (
    <Routes>
      {manifest.pages.map(page => {
        const Page = page.component;
        const element = page.permission && !hasPermission(page.permission) ? <Navigate to={homePath} replace /> : <Page />;
        return page.path ? (
          <Route key={page.path} path={page.path} element={element} />
        ) : (
          <Route key='index' index element={element} />
        );
      })}
      <Route path='*' element={<Navigate to={manifest.basePath} replace />} />
    </Routes>
  );
};

export default ModuleRoutes;
