// src/features/sistema/components/RelatedEvents.tsx
//
// Gli altri eventi della stessa richiesta (ADR039): stesso
// contesto.transazioneId, cioe' lo stesso ID generato dall'api-gateway, in
// qualunque servizio. In ordine di tempo: ricostruisce il percorso della
// richiesta (es. http_request in auth-service -> audit -> errore in un altro
// servizio). Un clic apre l'evento al posto di quello corrente.
import React, { useEffect, useState } from 'react';
import { Badge, Skeleton } from '@edg/ui';

import { cercaLogs } from '../api/logsApi';
import { esitoBadgeVariant, esitoLabel } from '../utils/logsFormat';
import type { AzioneLog } from '../types';

/** hh:mm:ss.mmm — i millisecondi distinguono l'ordine di eventi dello stesso secondo */
const formatTime = (iso: string) => {
  const d = new Date(iso);
  const hms = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return `${hms}.${String(d.getMilliseconds()).padStart(3, '0')}`;
};

interface RelatedEventsProps {
  transazioneId: string;
  currentId: string;
  onOpenLog?: (log: AzioneLog) => void;
}

export const RelatedEvents: React.FC<RelatedEventsProps> = ({ transazioneId, currentId, onOpenLog }) => {
  const [events, setEvents] = useState<AzioneLog[] | null>(null);

  useEffect(() => {
    let active = true;
    setEvents(null);
    cercaLogs({ transazioneId, limit: 64 })
      .then(res => active && setEvents([...res.logs].sort((a, b) => a.timestamp.localeCompare(b.timestamp))))
      .catch(() => active && setEvents([]));
    return () => {
      active = false;
    };
  }, [transazioneId]);

  if (events === null) return <Skeleton className='h-16 w-full' />;
  if (events.length <= 1) return <span className='text-text-secondary'>Nessun altro evento per questa richiesta</span>;

  return (
    <ol className='w-full divide-y divide-surface-border rounded-md border border-surface-border'>
      {events.map(e => {
        const isCurrent = e._id === currentId;
        return (
          <li key={e._id}>
            <button
              type='button'
              disabled={isCurrent || !onOpenLog}
              onClick={() => onOpenLog?.(e)}
              className={`flex w-full items-center gap-3 px-3 py-1.5 text-left text-sm ${
                isCurrent ? 'bg-surface-2 font-semibold' : 'hover:bg-surface-2'
              }`}
            >
              <span className='shrink-0 font-mono text-xs tabular-nums text-text-secondary'>{formatTime(e.timestamp)}</span>
              <span className='w-32 shrink-0 truncate text-xs text-text-secondary'>{e.azione.entita}</span>
              <span className='min-w-0 flex-1 truncate'>{e.azione.operazione}</span>
              <Badge size='xs' variant={esitoBadgeVariant(e.risultato.esito)}>
                {esitoLabel(e.risultato.esito)}
              </Badge>
            </button>
          </li>
        );
      })}
    </ol>
  );
};

export default RelatedEvents;
