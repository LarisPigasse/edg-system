// src/core/notifications/index.ts — avvisi dei moduli: campanella (ADR091) e pagina della piattaforma /avvisi (B8d-1 bis)
export type {
  ModuleNotification,
  ModuleNotificationPage,
  ModuleNotificationList,
  ModuleNotificationQuery,
  ModuleNotificationSource,
  NotificationFilter,
  ActiveNotificationSource,
  PlatformNotification,
} from './types';
export { NOTIFICATIONS_PATH } from './constants';
export { useModuleNotifications } from './hooks/useModuleNotifications';
export { useNotificationSources } from './hooks/useNotificationSources';
export { NotificationSourcesProvider } from './components/NotificationSourcesProvider';
export { NotificationRow } from './components/NotificationRow';
export { quandoNotifica } from './utils/quando';
