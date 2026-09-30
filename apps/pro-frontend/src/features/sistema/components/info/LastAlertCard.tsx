// src/features/sistema/components/info/LastAlertCard.tsx
//
// Ultimo allarme generato (ADR038): nell'intestazione gravita' e "Vedi
// storico"; sotto la regola con il gruppo nel titolo, esito e destinatari. "Vedi storico" sta sulla riga del titolo (con
// margine verticale negativo, cosi' non alza l'intestazione): la card resta
// alta quanto le due affiancate (Attivita', Allarmi).
import React from 'react';
import { Badge, Button, Card } from '@edg/ui';

import { formatDateTime } from '../../utils/healthFormat';
import AlertTitle from './AlertTitle';
import { ALERT_SEVERITY as SEVERITY } from '../../utils/alertFormat';
import type { AlertHistoryEntry } from '../../types/info';

interface LastAlertCardProps {
  alert: AlertHistoryEntry | null;
  onOpenHistory: () => void;
}

export const LastAlertCard: React.FC<LastAlertCardProps> = ({ alert, onOpenHistory }) => (
  <Card variant='default' padding='md' className='flex h-full flex-col gap-3'>
    <div className='flex items-center justify-between gap-2'>
      <div className='flex items-center gap-2'>
        <h3 className='text-xs font-semibold uppercase tracking-wider text-text-secondary'>Ultimo allarme</h3>
        {alert?.severity && SEVERITY[alert.severity] && (
          <Badge size='xs' variant={SEVERITY[alert.severity].variant} className='-my-1'>
            {SEVERITY[alert.severity].label}
          </Badge>
        )}
      </div>
      {alert && (
        <Button variant='outline' size='xs' className='-my-1' onClick={onOpenHistory}>
          Vedi storico
        </Button>
      )}
    </div>

    {!alert ? (
      <p className='text-sm text-text-secondary'>Nessun allarme generato finora.</p>
    ) : (
      <div className='flex flex-col gap-1'>
        <span className='text-sm font-semibold text-text-primary'>
          <AlertTitle ruleName={alert.ruleName} groupKey={alert.groupKey} />
        </span>
        <span className='text-xs text-text-secondary'>
          {alert.status === 'SENT' ? (
            <span className='text-text-success'>Inviato</span>
          ) : (
            <span className='text-text-danger'>Invio fallito{alert.error ? ` (${alert.error})` : ''}</span>
          )}
          {' a '}
          {alert.recipients?.length ? alert.recipients.join(', ') : alert.sentTo}
        </span>
        <span className='text-xs tabular-nums text-text-secondary'>{formatDateTime(alert.createdAt)}</span>
      </div>
    )}
  </Card>
);

export default LastAlertCard;
