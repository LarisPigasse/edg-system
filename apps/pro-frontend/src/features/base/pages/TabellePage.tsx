// src/features/base/pages/TabellePage.tsx
import React from 'react';
import { Building2, LayoutGrid, PageHeader, Tabs, type TabItem } from '@edg/ui';

import LookupTableTab, { type LookupTableConfig } from '../components/LookupTableTab';

/**
 * Contenitore per le tabelle di base (elenchi gestibili) di system-service.
 * Una nuova tabella si aggiunge qui come nuova scheda, con la sua
 * configurazione: niente nuove voci di menu, niente componenti copiati.
 */
const REPARTI: LookupTableConfig = {
  resource: 'reparti',
  idKey: 'idReparto',
  nameKey: 'reparto',
  noun: 'reparto',
  plural: 'Reparti',
  hint: 'Reparti aziendali di Express Delivery Group, assegnati agli operatori.',
};

// ADR059: settore di attività di clienti e partner, al posto di un elenco nel codice
const SETTORI: LookupTableConfig = {
  resource: 'settori',
  idKey: 'idSettore',
  nameKey: 'settore',
  noun: 'settore',
  plural: 'Settori',
  hint: 'Settori di attività delle aziende in anagrafica (es. trasportatore, azienda agricola, movimento terra).',
};

const TabellePage: React.FC = () => {
  const items: TabItem[] = [
    { id: 'reparti', label: 'Reparti', icon: Building2, content: <LookupTableTab config={REPARTI} /> },
    { id: 'settori', label: 'Settori', icon: LayoutGrid, content: <LookupTableTab config={SETTORI} /> },
  ];

  return (
    <div className='space-y-6'>
      <PageHeader title='Tabelle' subtitle='Elenchi di base usati dalle altre anagrafiche' />
      <Tabs items={items} />
    </div>
  );
};

export default TabellePage;
