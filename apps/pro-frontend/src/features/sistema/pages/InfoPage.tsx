// src/features/sistema/pages/InfoPage.tsx
//
// SISTEMA → Info (ADR038): salute della piattaforma e allarmi, in tre
// schede (Salute, Regole, Storico) più la Guida di sola lettura (ADR052). La pagina possiede solo lo stato
// condiviso (salute, scheda attiva) e compone i componenti di
// components/info.
//
// Scheda attiva nell'URL (?tab=salute|regole|storico|guida): sopravvive al
// ricaricamento e permette link diretti. Tabs di @edg/ui non e' controllabile
// dall'esterno (solo defaultTab): per cambiare scheda da codice ("Vedi
// storico") lo si rimonta con key = scheda attiva.
import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BellRing, BookOpen, HeartPulse, History } from 'lucide-react';
import { PageHeader, StatTile, Tabs, type TabItem } from '@edg/ui';

import { GuideTab, HealthTab, HistoryTab, RulesTab } from '../components/info';
import { useSystemHealth } from '../hooks/useSystemHealth';

const TAB_IDS = ['salute', 'regole', 'storico', 'guida'] as const;
type InfoTab = (typeof TAB_IDS)[number];

const isInfoTab = (v: string | null): v is InfoTab => !!v && (TAB_IDS as readonly string[]).includes(v);

const InfoPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: InfoTab = isInfoTab(searchParams.get('tab')) ? (searchParams.get('tab') as InfoTab) : 'salute';

  const { data, isLoading, isFetching, error, refresh } = useSystemHealth();

  const selectTab = useCallback(
    (tab: string) => {
      if (!isInfoTab(tab)) return;
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('tab', tab);
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const summary = data?.summary;
  const problems = summary ? summary.down + summary.degraded : 0;

  const items: TabItem[] = [
    {
      id: 'salute',
      label: 'Salute',
      icon: HeartPulse,
      content: (
        <HealthTab
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refresh}
          onOpenHistory={() => selectTab('storico')}
        />
      ),
    },
    {
      id: 'regole',
      label: 'Regole',
      icon: BellRing,
      content: <RulesTab />,
    },
    {
      id: 'storico',
      label: 'Storico',
      icon: History,
      content: <HistoryTab />,
    },
    {
      // Solo lettura: spiega i meccanismi della pagina con i valori dal vivo
      id: 'guida',
      label: 'Guida',
      icon: BookOpen,
      content: <GuideTab health={data ?? null} />,
    },
  ];

  return (
    <div className='flex flex-col'>
      <PageHeader
        title='Info'
        subtitle='Salute della piattaforma e allarmi'
        onRefresh={refresh}
        isLoading={isFetching}
        actions={
          <>
            <StatTile
              value={summary ? `${summary.up}/${summary.total}` : '—'}
              label='Operativi'
              tone={summary && summary.up === summary.total ? 'success' : 'default'}
              loading={isLoading}
            />
            <StatTile value={problems} label='Problemi' tone={problems > 0 ? 'danger' : 'default'} loading={isLoading} />
            <StatTile
              value={data?.stats.alertsWeek ?? 0}
              label='Allarmi 7 gg'
              tone={(data?.stats.alertsFailed ?? 0) > 0 ? 'warning' : 'default'}
              loading={isLoading}
            />
          </>
        }
      />

      <Tabs key={activeTab} items={items} defaultTab={activeTab} variant='default' onTabChange={selectTab} />
    </div>
  );
};

export default InfoPage;
