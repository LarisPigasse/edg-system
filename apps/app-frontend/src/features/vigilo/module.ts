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
import { soloAddetto, ufficio } from './utils/capacita';

const BASE = '/vigilo';

export const vigiloModule: AppModuleManifest = {
  key: 'vigilo',
  name: 'Vigilo',
  label: 'VIGILO',
  basePath: BASE,
  icon: Clock,
  // Prima della procedura di avvio si aprono solo la home (che porta alla
  // procedura o dice che Vigilo è in preparazione) e la procedura stessa;
  // le altre pagine passano da dopoAvvio. L'addetto (solo vigilo.own, B9b) ha
  // le sue due pagine; la home lo porta a "Le mie scadenze".
  pages: [
    { path: '', component: lazy(() => import('./pages/VigiloHome')) },
    // Procedura di avvio e, dopo, "Aggiungi dalla libreria" (ADR076)
    { path: 'avvio', component: lazy(() => import('./pages/AvvioPage')), permission: 'vigilo.config' },
    { path: 'scadenze', component: dopoAvvio(() => import('./pages/ScadenzePage')), quando: ufficio },
    { path: 'soggetti', component: dopoAvvio(() => import('./pages/SoggettiPage')), quando: ufficio },
    { path: 'soggetti/nuovo', component: dopoAvvio(() => import('./pages/NuovoSoggettoPage')), quando: ufficio },
    // senza condizione: un addetto che ci arriva da un'email va alla sua scadenza in "Le mie scadenze"
    { path: 'soggetti/:id', component: dopoAvvio(() => import('./pages/SoggettoPage')) },
    { path: 'calendario', component: dopoAvvio(() => import('./pages/CalendarioPage')), quando: ufficio },
    { path: 'mie-scadenze', component: lazy(() => import('./pages/MieScadenzePage')), quando: soloAddetto },
    { path: 'miei-mezzi', component: lazy(() => import('./pages/MieiMezziPage')), quando: soloAddetto },
    // Gli avvisi del solo Vigilo; quelli di tutti i moduli sono in /avvisi (B8d-1 bis)
    { path: 'avvisi', component: dopoAvvio(() => import('./pages/AvvisiPage')) },
    { path: 'configurazione', component: dopoAvvio(() => import('./pages/ConfigurazionePage')), permission: 'vigilo.config' },
  ],
  // Le altre voci (Fornitori…) arrivano con le loro pagine
  menu: [
    { id: 'dashboard', label: 'Dashboard', path: '', quando: ufficio },
    { id: 'scadenze', label: 'Scadenze', path: 'scadenze', quando: ufficio },
    { id: 'soggetti', label: 'Soggetti', path: 'soggetti', quando: ufficio },
    { id: 'calendario', label: 'Calendario', path: 'calendario', quando: ufficio },
    { id: 'mie-scadenze', label: 'Le mie scadenze', path: 'mie-scadenze', quando: soloAddetto },
    { id: 'miei-mezzi', label: 'I miei mezzi', path: 'miei-mezzi', quando: soloAddetto },
    { id: 'avvisi', label: 'Avvisi', path: 'avvisi' },
    { id: 'configurazione', label: 'Configurazione', path: 'configurazione', permission: 'vigilo.config' },
  ],
  // Avvisi delle scadenze nella campanella e nella pagina /avvisi (ADR090-ADR091, B8d-1 bis);
  // le preferenze si caricano solo quando la pagina le mostra
  notifications: { ...sorgenteAvvisi(BASE), settings: lazy(() => import('./components/avvisi/PreferenzeVigilo')) },
  // "Non ricevere più questi avvisi" per chi riceve le email senza account (B8d-4)
  publicPages: [{ path: 'non-ricevere', component: lazy(() => import('./pages/NonRicevereAvvisiPage')) }],
};
