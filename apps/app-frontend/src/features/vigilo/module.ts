// src/features/vigilo/module.ts
//
// Manifest di Vigilo: scadenze, manutenzioni e controlli periodici di veicoli,
// mezzi e addetti (ADR010, ADR047). Sostituirà il vecchio modulo vehicles.
// I moduli non si importano fra loro: tutto ciò che serve a Vigilo sta qui
// dentro o in core/.
import { lazy } from 'react';
import { Clock } from '@edg/ui';

import type { AppModuleManifest } from '../../core/modules/types';

export const vigiloModule: AppModuleManifest = {
  key: 'vigilo',
  name: 'Vigilo',
  label: 'VIGILO',
  basePath: '/vigilo',
  icon: Clock,
  pages: [
    { path: '', component: lazy(() => import('./pages/VigiloHome')) },
    // Procedura di avvio e, dopo, "Aggiungi dalla libreria" (ADR076)
    { path: 'scadenze', component: lazy(() => import('./pages/ScadenzePage')) },
    { path: 'soggetti', component: lazy(() => import('./pages/SoggettiPage')) },
    { path: 'soggetti/nuovo', component: lazy(() => import('./pages/NuovoSoggettoPage')) },
    { path: 'soggetti/:id', component: lazy(() => import('./pages/SoggettoPage')) },
    { path: 'avvio', component: lazy(() => import('./pages/AvvioPage')), permission: 'vigilo.config' },
    { path: 'configurazione', component: lazy(() => import('./pages/ConfigurazionePage')), permission: 'vigilo.config' },
  ],
  // Le altre voci (Calendario, Fornitori…) arrivano con le loro pagine
  menu: [
    { id: 'dashboard', label: 'Dashboard', path: '' },
    { id: 'scadenze', label: 'Scadenze', path: 'scadenze' },
    { id: 'soggetti', label: 'Soggetti', path: 'soggetti' },
    { id: 'configurazione', label: 'Configurazione', path: 'configurazione', permission: 'vigilo.config' },
  ],
};
