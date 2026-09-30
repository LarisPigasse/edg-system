// src/features/sistema/components/info/rules/RecipientsSection.tsx
//
// Sezione "Destinatari" della scheda Regole (ADR038). Eliminare un
// destinatario lo toglie anche dalle regole che lo indicano: quelle rimaste
// senza destinatari specifici tornano ai predefiniti (log-service).
import React, { useState } from 'react';
import { Badge, ConfirmModal, Table, type Action, type TableColumn } from '@edg/ui';

import SectionHeader from './SectionHeader';
import RecipientFormModal from './RecipientFormModal';
import type { AlertRecipient, AlertRecipientInput } from '../../../types/info';

interface RecipientsSectionProps {
  recipients: AlertRecipient[];
  isLoading: boolean;
  isSaving: boolean;
  onSave: (id: string | null, input: AlertRecipientInput) => Promise<boolean>;
  onToggle: (recipient: AlertRecipient) => Promise<void>;
  onDelete: (recipient: AlertRecipient) => Promise<void>;
}

export const RecipientsSection: React.FC<RecipientsSectionProps> = ({
  recipients,
  isLoading,
  isSaving,
  onSave,
  onToggle,
  onDelete,
}) => {
  const [modalItem, setModalItem] = useState<AlertRecipient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<AlertRecipient | null>(null);

  const openCreate = () => {
    setModalItem(null);
    setIsModalOpen(true);
  };
  const openEdit = (r: AlertRecipient) => {
    setModalItem(r);
    setIsModalOpen(true);
  };
  const handleSave = async (input: AlertRecipientInput) => {
    if (await onSave(modalItem?._id ?? null, input)) setIsModalOpen(false);
  };

  const hasActiveDefault = recipients.some(r => r.enabled && r.isDefault);

  const columns: TableColumn<AlertRecipient>[] = [
    { header: 'Nome', accessor: r => <span className='font-medium text-text-primary'>{r.name}</span> },
    { header: 'Email', accessor: r => r.email },
    {
      header: 'Predefinito',
      accessor: r =>
        r.isDefault ? (
          <Badge size='xs' variant='info'>
            Predefinito
          </Badge>
        ) : null,
    },
    { header: 'Regole', accessor: r => <span className='tabular-nums'>{r.rulesCount}</span> },
    {
      header: 'Stato',
      accessor: r => <Badge variant={r.enabled ? 'success' : 'default'}>{r.enabled ? 'Attivo' : 'Disattivo'}</Badge>,
    },
  ];

  const toggleAction = (r: AlertRecipient): Action[] => [
    {
      id: 'toggle',
      label: r.enabled ? 'Disattiva' : 'Attiva',
      onClick: () => void onToggle(r),
      variant: r.enabled ? 'warning' : 'success',
    },
  ];

  return (
    <section className='flex flex-col gap-3'>
      <SectionHeader title='Destinatari' count={recipients.length} createLabel='Nuovo destinatario' onCreate={openCreate} />

      {!isLoading && !hasActiveDefault && (
        <p className='rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-sm text-text-secondary'>
          Nessun destinatario predefinito attivo: gli allarmi delle regole senza destinatari specifici vanno
          all’indirizzo di ripiego configurato sul server (<span className='font-mono'>EMAIL_ALERTS_TO</span>).
        </p>
      )}

      <Table
        data={recipients}
        columns={columns}
        keyExtractor={r => r._id}
        isLoading={isLoading}
        emptyMessage='Nessun destinatario definito'
        striped
        hoverable
        rowActions={{
          enabled: true,
          actions: toggleAction,
          quickActions: {
            edit: { enabled: true, onEdit: openEdit },
            delete: { enabled: true, onDelete: r => setToDelete(r), getItemName: r => r.name },
          },
        }}
      />

      <RecipientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
        item={modalItem}
      />

      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await onDelete(toDelete);
          setToDelete(null);
        }}
        title='Elimina destinatario'
        message={
          toDelete?.rulesCount
            ? `Eliminare "${toDelete.name}"? Verrà tolto anche da ${toDelete.rulesCount} ${toDelete.rulesCount === 1 ? 'regola' : 'regole'}.`
            : `Eliminare il destinatario "${toDelete?.name}"?`
        }
        variant='danger'
        confirmText='Elimina'
      />
    </section>
  );
};

export default RecipientsSection;
