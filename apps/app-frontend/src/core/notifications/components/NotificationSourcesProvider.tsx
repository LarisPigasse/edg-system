// src/core/notifications/components/NotificationSourcesProvider.tsx
//
// Mette a disposizione delle pagine le sorgenti degli avvisi attive e
// "rileggi la campanella" (useNotificationSources).
import React, { useMemo } from 'react';

import { NotificationSourcesContext } from '../hooks/useNotificationSources';
import type { ActiveNotificationSource } from '../types';

export const NotificationSourcesProvider: React.FC<{ sources: ActiveNotificationSource[]; refresh?: () => void; children: React.ReactNode }> = ({
  sources,
  refresh,
  children,
}) => {
  const value = useMemo(() => ({ sources, refresh: refresh ?? (() => undefined) }), [sources, refresh]);
  return <NotificationSourcesContext.Provider value={value}>{children}</NotificationSourcesContext.Provider>;
};
