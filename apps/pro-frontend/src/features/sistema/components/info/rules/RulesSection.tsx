// src/features/sistema/components/info/rules/RulesSection.tsx
//
// Sezione "Regole" della scheda Regole (ADR038): tabella con riepilogo di
// ogni regola, azioni per riga (modifica, attiva/disattiva, elimina) e
// modale di creazione/modifica. Le regole predefinite non sono eliminabili
// (vincolo applicato anche da log-service).
import React, { useMemo, useState } from 'react';
import { Badge, ConfirmModal, Power, Table, type TableRowAction, type TableColumn } from '@edg/ui';

import SectionHeader from './SectionHeader';
import RuleFormModal from './RuleFormModal';
import { formatCooldown, ruleSubject, ruleTrigger } from '../../../utils/alertFormat';
import { formatAgo } from '../../../utils/healthFormat';
import type { AlertRecipient, AlertRule, AlertRuleInput, EventTypeOption } from '../../../types/info';

interface RulesSectionProps {
  rules: AlertRule[];
  recipients: AlertRecipient[];
  eventTypes: EventTypeOption[];
  isLoading: boolean;
  isSaving: boolean;
  onSave: (id: string | null, input: AlertRuleInput) => Promise<boolean>;
  onToggle: (rule: AlertRule) => Promise<void>;
  onDelete: (rule: AlertRule) => Promise<void>;
}

export const RulesSection: React.FC<RulesSectionProps> = ({
  rules,
  recipients,
  eventTypes,
  isLoading,
  isSaving,
  onSave,
  onToggle,
  onDelete,
}) => {
  const [modalItem, setModalItem] = useState<AlertRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<AlertRule | null>(null);

  const recipientName = useMemo(() => new Map(recipients.map(r => [r._id, r.name])), [recipients]);

  const openCreate = () => {
    setModalItem(null);
    setIsModalOpen(true);
  };
  const openEdit = (rule: AlertRule) => {
    setModalItem(rule);
    setIsModalOpen(true);
  };
  const handleSave = async (input: AlertRuleInput) => {
    if (await onSave(modalItem?._id ?? null, input)) setIsModalOpen(false);
  };

  const now = Date.now();
  const columns: TableColumn<AlertRule>[] = [
    {
      header: 'Regola',
      accessor: r => (
        <div className='flex flex-col gap-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='font-medium text-text-primary'>{r.name}</span>
            {r.systemKey && (
              <Badge size='xs' variant='info'>
                Predefinita
              </Badge>
            )}
          </div>
          {r.description && <span className='line-clamp-1 text-xs text-text-secondary'>{r.description}</span>}
        </div>
      ),
    },
    {
      header: 'Quando scatta',
      accessor: r => (
        <div className='flex flex-col gap-0.5'>
          <span className='font-mono text-xs text-text-primary'>{ruleSubject(r)}</span>
          <span className='text-xs text-text-secondary'>{ruleTrigger(r)}</span>
        </div>
      ),
    },
    {
      header: 'Destinatari',
      accessor: r =>
        r.recipientIds.length ? (
          <span className='text-sm'>{r.recipientIds.map(id => recipientName.get(id) ?? '—').join(', ')}</span>
        ) : (
          <span className='text-sm text-text-secondary'>Predefiniti</span>
        ),
    },
    { header: 'Pausa', accessor: r => <span className='tabular-nums'>{formatCooldown(r.cooldownMinutes)}</span> },
    {
      header: 'Ultimo allarme',
      accessor: r => <span className='tabular-nums text-text-secondary'>{r.lastTriggeredAt ? formatAgo(r.lastTriggeredAt, now) : 'mai'}</span>,
    },
    {
      header: 'Stato',
      accessor: r => <Badge variant={r.enabled ? 'success' : 'default'}>{r.enabled ? 'Attiva' : 'Disattiva'}</Badge>,
    },
  ];

  const toggleAction = (rule: AlertRule): TableRowAction[] => [
    {
      id: 'toggle',
      icon: <Power className='w-4 h-4' />,
      label: rule.enabled ? 'Disattiva' : 'Attiva',
      onClick: () => void onToggle(rule),
      variant: rule.enabled ? 'warning' : 'success',
    },
  ];

  return (
    <section className='flex flex-col gap-3'>
      <SectionHeader title='Regole' count={rules.length} createLabel='Nuova regola' onCreate={openCreate} />

      <Table
        data={rules}
        columns={columns}
        keyExtractor={r => r._id}
        isLoading={isLoading}
        emptyMessage='Nessuna regola definita'
        striped
        hoverable
        rowActions={{
          enabled: true,
          actions: toggleAction,
          quickActions: {
            edit: { enabled: true, onEdit: openEdit },
            delete: {
              enabled: true,
              onDelete: r => setToDelete(r),
              canDelete: r => !r.systemKey,
              getItemName: r => r.name,
            },
          },
        }}
      />

      <RuleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
        item={modalItem}
        eventTypes={eventTypes}
        recipients={recipients}
      />

      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await onDelete(toDelete);
          setToDelete(null);
        }}
        title='Elimina regola'
        message={`Eliminare la regola "${toDelete?.name}"? Lo storico dei suoi allarmi resta consultabile.`}
        variant='danger'
        confirmText='Elimina'
      />
    </section>
  );
};

export default RulesSection;
