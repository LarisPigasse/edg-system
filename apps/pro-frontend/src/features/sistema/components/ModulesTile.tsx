// src/features/sistema/components/ModulesTile.tsx
//
// Riquadri dei moduli nella home (ADR054-057): uno per ogni modulo del
// catalogo non dismesso: logo e sottotitolo, nel piede versione e stato.
// Restituisce le sole voci <li>: la griglia è della home, che le mette dopo il
// riquadro del frontend. Legge il catalogo, quindi lo vede chi ha
// sistema.moduli; in caso di errore tace (la home non si riempie di avvisi).
import React, { useEffect, useState } from 'react';
import { HomeModuleTile } from '@edg/ui';

import { listCatalog } from '../api/moduleApi';
import { staffHomeStatus } from '../utils/moduleFormat';
import type { CatalogModule } from '../types/modules';
import { moduleImages } from '../../../assets/moduli';

const byProductAndName = (a: CatalogModule, b: CatalogModule) =>
  a.product.localeCompare(b.product) || a.name.localeCompare(b.name);

const ModulesTile: React.FC = () => {
  const [modules, setModules] = useState<CatalogModule[]>([]);

  useEffect(() => {
    let alive = true;
    listCatalog()
      .then(list => {
        if (alive) setModules(list.filter(m => m.status !== 'dismesso').sort(byProductAndName));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      {modules.map(m => (
        <li key={m.key}>
          <HomeModuleTile
            name={m.name}
            subtitle={m.description}
            version={m.version}
            status={staffHomeStatus(m)}
            branding={m.branding}
            images={moduleImages(m.key)}
          />
        </li>
      ))}
    </>
  );
};

export default ModulesTile;
