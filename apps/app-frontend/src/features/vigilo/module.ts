// src/features/vigilo/module.ts
//
// Manifest di Vigilo: scadenze, manutenzioni e controlli periodici di veicoli,
// mezzi e addetti (ADR010, ADR047). Sostituirà il vecchio modulo vehicles.
// I moduli non si importano fra loro: tutto ciò che serve a Vigilo sta qui
// dentro o in core/.
import { lazy } from 'react';
import { Clock } from '@edg/ui';

import type { AppModuleManifest } from '../../core/modules/types';
import { sorgenteAvvisi } from './api/avvisi';
import { dopoAvvio } from './components/dopoAvvio';

const BASE = '/vigilo';

export const vigiloModule: AppModuleManifest = {
  key: 'vigilo',
  name: 'Vigilo',
  label: 'VIGILO',
  basePath: BASE,
  icon: Clock,
  // Prima della procedura di avvio si aprono solo la home (che porta alla
  // procedura o dice che Vigilo è in preparazione) e la procedura stessa;
  // le altre pagine passano da dopoAvvio.
  pages: [
    { path: '', component: lazy(() => import('./pages/VigiloHome')) },
    // Procedura di avvio e, dopo, "Aggiungi dalla libreria" (ADR076)
    { path: 'avvio', component: lazy(() => import('./pages/AvvioPage')), permission: 'vigilo.config' },
    { path: 'scadenze', component: dopoAvvio(() => import('./pages/ScadenzePage')) },
    { path: 'soggetti', component: dopoAvvio(() => import('./pages/SoggettiPage')) },
    { path: 'soggetti/nuovo', component: dopoAvvio(() => import('./pages/NuovoSoggettoPage')) },
    { path: 'soggetti/:id', component: dopoAvvio(() => import('./pages/SoggettoPage')) },
    { path: 'calendario', component: dopoAvvio(() => import('./pages/CalendarioPage')) },
    { path: 'configurazione', component: dopoAvvio(() => import('./pages/ConfigurazionePage')), permission: 'vigilo.config' },
  ],
  // Le altre voci (Fornitori…) arrivano con le loro pagine
  menu: [
    { id: 'dashboard', label: 'Dashboard', path: '' },
    { id: 'scadenze', label: 'Scadenze', path: 'scadenze' },
    { id: 'soggetti', label: 'Soggetti', path: 'soggetti' },
    { id: 'calendario', label: 'Calendario', path: 'calendario' },
    { id: 'configurazione', label: 'Configurazione', path: 'configurazione', permission: 'vigilo.config' },
  ],
  // Avvisi delle scadenze nella campanella (ADR090-ADR091)
  notifications: sorgenteAvvisi(BASE),
};
