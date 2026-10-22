// packages/ui/src/components/navigation/notification-bell/NotificationBell.data.ts
import type { ComponentData } from '../../../types';

export const notificationBellData: ComponentData = {
  id: 'notificationBell',
  title: 'NotificationBell',
  description:
    'Campanella degli avvisi: numero dei da leggere (rosso se ce n\'è uno urgente) e pannello con le voci recenti, "Segna tutti come letti" e un collegamento in fondo. Nell\'header compare da sola quando EdgConfig.notifications c\'è.',
  category: 'navigation',
  importPath: 'import { NotificationBell, type EdgNotifications } from "@edg/ui";',
  origin: 'Custom Component',
  dependence: '@radix-ui/react-popover, react-router-dom, Skeleton',
  props: [
    { name: 'items', type: 'EdgNotification[]', required: true, description: 'Le voci, già in ordine (di norma dalla più recente).' },
    { name: 'unread', type: 'number', required: true, description: 'Da leggere in tutto, anche oltre le voci mostrate; oltre 64 si legge "64+".' },
    { name: 'loading', type: 'boolean', description: 'Prima lettura in corso (scheletri se non ci sono voci).' },
    { name: 'error', type: 'string | null', description: 'Errore di lettura, mostrato se non ci sono voci.' },
    { name: 'onOpen', type: '() => void', description: 'Il pannello si apre: occasione per rileggere.' },
    { name: 'onSelect', type: '(item) => void', description: "Clic su una voce (di norma la segna come letta); poi si va a item.href, se c'è." },
    { name: 'onReadAll', type: '() => void', description: '"Segna tutti come letti"; assente = nessun pulsante.' },
    { name: 'footer', type: '{ label: string; href: string }', description: 'Collegamento in fondo al pannello.' },
    { name: 'title', type: 'string', defaultValue: '"Avvisi"', description: 'Titolo del pannello e nome accessibile.' },
  ],
  examples: [
    {
      title: "Nell'header, dalla configurazione",
      description: "L'applicazione unisce le sorgenti (es. i moduli) e passa dati e azioni: l'header disegna la campanella.",
      code: `<EdgConfigProvider config={{ ...EDG_CONFIG, notifications: {
  items, unread, loading,
  onOpen: ricarica,
  onSelect: n => segnaLetto(n.id),
  onReadAll: segnaTutti,
  footer: { label: 'I miei avvisi', href: '/vigilo/avvisi' },
} }}>`,
    },
  ],
  notes:
    'EdgNotification: id unico fra le sorgenti, text (prima riga), detail (seconda riga, facoltativa), source, tone (default/warning/danger: colore del pallino), unread, resolved (in grigio, "non serve più"), date ISO, href. Il "quando" è relativo: adesso, 8 min fa, oggi alle 08:16, ieri alle 18:04, 16 ott.',
};
