// src/features/base/pages/TabellePage.tsx
import React from 'react';
import { Building2, PageHeader, Tabs, type TabItem } from '@edg/ui';

import RepartiTab from '../components/RepartiTab';

/**
 * Contenitore per le tabelle primitive (elenchi chiusi/gestibili) di
 * system-service. Oggi solo "Reparti": in futuro nuove tabelle primitive
 * (es. categorie, tipi documento...) si aggiungono qui come nuove tab,
 * senza aggiungere nuove voci di menu.
 */
const TabellePage: React.FC = () => {
  const items: TabItem[] = [
    {
      id: 'reparti',
      label: 'Reparti',
      icon: Building2,
      content: <RepartiTab />,
    },
  ];

  return (
    <div className='space-y-6'>
      <PageHeader title='Tabelle' subtitle='Elenchi di base usati dalle altre anagrafiche' />
      <Tabs items={items} />
    </div>
  );
};

export default TabellePage;
