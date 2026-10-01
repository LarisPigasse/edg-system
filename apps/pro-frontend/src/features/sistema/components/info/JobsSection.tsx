// src/features/sistema/components/info/JobsSection.tsx
//
// Processi pianificati attesi nella scheda Salute (ADR039): per ciascuno
// pianificazione, ultima esecuzione (quando, durata, riepilogo o errore) e
// stato. "In ritardo" significa che non c'e' stata nessuna esecuzione
// riuscita entro il tempo previsto: il processo potrebbe non essere partito.
// "Invia riepilogo ora" esegue subito il riepilogo giornaliero (ADR046), che
// e' a sua volta uno dei processi elencati.
import React, { useState } from 'react';
import { Badge, Button, Table, useToast, type TableColumn } from '@edg/ui';

import { useNow } from '../../../../shared/hooks/useNow';
import { formatAgo, formatDateTime } from '../../utils/healthFormat';
import { sendDigestNow } from '../../api/infoApi';
import type { JobState, JobStatus } from '../../types/info';

const STATUS: Record<JobStatus, { label: string; variant: 'success' | 'danger' | 'warning' | 'default' }> = {
  OK: { label: 'Regolare', variant: 'success' },
  FAILED: { label: 'Fallito', variant: 'danger' },
  LATE: { label: 'In ritardo', variant: 'danger' },
  PENDING: { label: 'In attesa', variant: 'default' },
};

const formatDuration = (ms: number | null) =>
  ms === null ? '—' : ms < 1024 ? `${ms} ms` : `${(ms / 1000).toFixed(1).replace('.', ',')} s`;

interface JobsSectionProps {
  jobs: JobState[];
  /** Dopo un'esecuzione a richiesta: rilegge lo stato dei processi */
  onChanged: () => void;
}

export const JobsSection: React.FC<JobsSectionProps> = ({ jobs, onChanged }) => {
  const now = useNow(16000);
  const toast = useToast();
  const [sending, setSending] = useState(false);

  const handleSendDigest = async () => {
    setSending(true);
    try {
      toast?.({ title: await sendDigestNow() });
    } catch (err) {
      toast?.danger({ title: 'Riepilogo non inviato', description: (err as Error).message });
    } finally {
      setSending(false);
      onChanged();
    }
  };

  if (jobs.length === 0) return null;
  const ok = jobs.filter(j => j.status === 'OK').length;

  const columns: TableColumn<JobState>[] = [
    {
      header: 'Processo',
      accessor: j => (
        <div className='flex flex-col gap-0.5'>
          <span className='font-medium text-text-primary'>{j.name}</span>
          <span className='text-xs text-text-secondary'>{j.service}</span>
        </div>
      ),
    },
    { header: 'Pianificazione', accessor: j => <span className='text-sm'>{j.schedule}</span> },
    {
      header: 'Ultima esecuzione',
      accessor: j =>
        j.lastRunAt ? (
          <span className='tabular-nums' title={formatDateTime(j.lastRunAt)}>
            {formatAgo(j.lastRunAt, now)}
          </span>
        ) : (
          <span className='text-text-secondary'>mai</span>
        ),
    },
    { header: 'Durata', accessor: j => <span className='tabular-nums'>{formatDuration(j.lastDurationMs)}</span> },
    {
      header: 'Esito',
      accessor: j =>
        j.lastOutcome === 'failed' ? (
          <span className='block max-w-96 truncate text-sm text-text-danger' title={j.lastError ?? undefined}>
            {j.lastError ?? 'Errore'}
          </span>
        ) : (
          <span className='block max-w-96 truncate text-sm text-text-secondary' title={j.lastSummary ?? undefined}>
            {j.lastSummary ?? '—'}
          </span>
        ),
    },
    {
      header: 'Stato',
      accessor: j => (
        <span title={j.status === 'LATE' && j.dueBy ? `Atteso entro ${formatDateTime(j.dueBy)}` : undefined}>
          <Badge size='xs' variant={STATUS[j.status].variant}>
            {STATUS[j.status].label}
          </Badge>
        </span>
      ),
    },
  ];

  return (
    <section className='flex flex-col gap-2'>
      <header className='flex items-end justify-between gap-4'>
        <div className='flex items-baseline gap-2'>
          <h3 className='text-xs font-semibold uppercase tracking-wider text-text-secondary'>Processi pianificati</h3>
          <span className='text-xs tabular-nums text-text-secondary'>
            {ok}/{jobs.length}
          </span>
        </div>
        <Button variant='outline' size='xs' onClick={handleSendDigest} isLoading={sending} loadingText='Invio in corso...'>
          Invia riepilogo ora
        </Button>
      </header>
      <Table data={jobs} columns={columns} keyExtractor={j => j.id} striped />
    </section>
  );
};

export default JobsSection;
