// src/features/sistema/components/info/history/HistoryTab.tsx
//
// Scheda "Storico" di SISTEMA → Info (ADR038): tutti gli allarmi generati,
// inviati o falliti, con filtri e paginazione lato server. Un clic sulla
// riga apre l'evento che ha fatto scattare l'allarme, con la stessa modale
// di dettaglio della pagina Logs.
import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Table, Tooltip, useToast, type SelectOption, type TableColumn } from '@edg/ui';

import HistoryFilters from './HistoryFilters';
import AlertTitle from '../AlertTitle';
import LogsPager from '../../LogsPager';
import LogDetailModal from '../../LogDetailModal';
import { getAlertRules } from '../../../api/infoApi';
import { getLog } from '../../../api/logsApi';
import { useAlertHistory } from '../../../hooks/useAlertHistory';
import { ALERT_SEVERITY } from '../../../utils/alertFormat';
import { formatDateTime } from '../../../utils/healthFormat';
import type { AzioneLog } from '../../../types';
import type { AlertHistoryEntry } from '../../../types/info';

export const HistoryTab: React.FC = () => {
  const toast = useToast();
  const history = useAlertHistory();
  const [ruleOptions, setRuleOptions] = useState<SelectOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AzioneLog | null>(null);

  // Regole per il filtro: quelle esistenti (lo storico conserva comunque il
  // nome delle regole eliminate, che restano visibili nelle righe)
  useEffect(() => {
    getAlertRules()
      .then(rules => setRuleOptions(rules.map(r => ({ value: r._id, label: r.name }))))
      .catch(() => setRuleOptions([]));
  }, []);

  const openEvent = async (entry: AlertHistoryEntry) => {
    try {
      setSelectedEvent(await getLog(entry.triggeringEventId));
    } catch (err) {
      toast?.danger({ title: "Evento non disponibile", description: (err as Error).message });
    }
  };

  const columns: TableColumn<AlertHistoryEntry>[] = useMemo(
    () => [
      {
        header: 'Quando',
        accessor: e => <span className='whitespace-nowrap tabular-nums'>{formatDateTime(e.createdAt)}</span>,
      },
      {
        header: 'Allarme',
        accessor: e => (
          <span className='font-medium text-text-primary'>
            <AlertTitle ruleName={e.ruleName} groupKey={e.groupKey} />
          </span>
        ),
      },
      {
        header: 'Gravità',
        accessor: e =>
          e.severity && ALERT_SEVERITY[e.severity] ? (
            <Badge size='xs' variant={ALERT_SEVERITY[e.severity].variant}>
              {ALERT_SEVERITY[e.severity].label}
            </Badge>
          ) : null,
      },
      { header: 'Eventi', accessor: e => <span className='tabular-nums'>{e.matchCount}</span> },
      {
        header: 'Destinatari',
        accessor: e => {
          const text = e.recipients?.length ? e.recipients.join(', ') : e.sentTo;
          return (
            <span className='block max-w-64 truncate text-sm text-text-secondary' title={text}>
              {text}
            </span>
          );
        },
      },
      {
        header: 'Esito',
        accessor: e =>
          e.status === 'SENT' ? (
            <Badge size='xs' variant='success'>
              Inviato
            </Badge>
          ) : (
            <Tooltip content={e.error ?? 'Invio non riuscito'} side='left'>
              <span>
                <Badge size='xs' variant='danger'>
                  Fallito
                </Badge>
              </span>
            </Tooltip>
          ),
      },
    ],
    []
  );

  return (
    <div className='flex flex-col gap-4'>
      <HistoryFilters
        value={history.filters}
        onChange={history.setFilters}
        onReset={history.resetFilters}
        ruleOptions={ruleOptions}
      />

      <Table
        data={history.items}
        columns={columns}
        keyExtractor={e => e._id}
        isLoading={history.isLoading}
        emptyMessage='Nessun allarme per i filtri scelti'
        striped
        hoverable
        onRowClick={openEvent}
      />

      <LogsPager
        page={history.page}
        totalPages={history.totalPages}
        totalCount={history.total}
        isLoading={history.isLoading}
        onPrev={() => history.setPage(p => Math.max(0, p - 1))}
        onNext={() => history.setPage(p => p + 1)}
        unitLabel='allarmi'
      />

      <LogDetailModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        log={selectedEvent}
        onOpenLog={setSelectedEvent}
      />
    </div>
  );
};

export default HistoryTab;
