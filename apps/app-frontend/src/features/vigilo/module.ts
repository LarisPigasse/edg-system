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
  pages: [{ path: '', component: lazy(() => import('./pages/VigiloHome')) }],
};
