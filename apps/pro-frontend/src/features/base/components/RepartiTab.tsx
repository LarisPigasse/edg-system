// src/features/base/components/RepartiTab.tsx
import React, { useState } from 'react';
import {
  Table,
  Modal,
  ConfirmModal,
  CreateAction,
  ExportPdfAction,
  Input,
  Switch,
  Badge,
  Button,
  exportTableToPdf,
  type TableColumn,
} from '@edg/ui';

import { useEntityCrud } from '../hooks/useEntityCrud';
import type { Reparto, RepartoInput } from '../types';

const EMPTY_FORM: RepartoInput = { reparto: '', isActive: true };

const RepartiTab: React.FC = () => {
  const { items, isLoading, isSaving, create, update, remove } = useEntityCrud<Reparto>({
    resource: 'reparti',
    label: 'Reparto',
    statusFilter: 'all', // tabella primitiva: pochi record, ha senso vederli tutti
  });

  const [modalItem, setModalItem] = useState<Reparto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<RepartoInput>(EMPTY_FORM);
  const [toDelete, setToDelete] = useState<Reparto | null>(null);

  const openCreate = () => {
    setModalItem(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (item: Reparto) => {
    setModalItem(item);
    setForm({ reparto: item.reparto, isActive: item.isActive });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const ok = modalItem ? await update(modalItem.idReparto, form) : await create(form);
    if (ok) setIsModalOpen(false);
  };

  const columns: TableColumn<Reparto>[] = [
    { header: 'Reparto', accessor: 'reparto', sortable: true },
    {
      header: 'Stato',
      accessor: item => <Badge variant={item.isActive ? 'success' : 'default'}>{item.isActive ? 'Attivo' : 'Disattivo'}</Badge>,
    },
  ];

  const handleExportPdf = () => {
    exportTableToPdf({
      filename: 'reparti',
      title: 'Reparti',
      columns: [
        { header: 'Reparto', accessor: item => item.reparto },
        { header: 'Stato', accessor: item => (item.isActive ? 'Attivo' : 'Disattivo') },
      ],
      data: items,
    });
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-end gap-3'>
        <ExportPdfAction onClick={handleExportPdf} disabled={items.length === 0} />
        <CreateAction onClick={openCreate} label='Nuovo reparto' />
      </div>

      <Table
        data={items}
        columns={columns}
        keyExtractor={item => item.idReparto}
        isLoading={isLoading}
        emptyMessage='Nessun reparto presente'
        striped
        hoverable
        rowActions={{
          enabled: true,
          quickActions: {
            edit: { enabled: true, onEdit: openEdit },
            delete: {
              enabled: true,
              onDelete: item => setToDelete(item),
              getItemName: item => item.reparto,
            },
          },
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalItem ? 'Modifica reparto' : 'Nuovo reparto'}
        size='sm'
        footer={
          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Annulla
            </Button>
            <Button variant='primary' onClick={handleSave} isLoading={isSaving} loadingText='Salvataggio...'>
              Salva
            </Button>
          </div>
        }
      >
        <div className='space-y-4'>
          <Input
            label='Nome reparto'
            value={form.reparto}
            onChange={e => setForm(f => ({ ...f, reparto: e.target.value }))}
            maxLength={64}
            required
          />
          <Switch
            label='Attivo'
            checked={form.isActive ?? true}
            onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
          />
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await remove(toDelete.idReparto);
          setToDelete(null);
        }}
        title='Elimina reparto'
        message={`Eliminare il reparto "${toDelete?.reparto}"?`}
        variant='danger'
        confirmText='Elimina'
      />
    </div>
  );
};

export default RepartiTab;
