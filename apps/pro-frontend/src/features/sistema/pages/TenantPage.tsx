// src/features/sistema/pages/TenantPage.tsx
import React, { useState } from 'react';
import {
  PageHeader,
  Table,
  ConfirmModal,
  CreateAction,
  ExportPdfAction,
  Select,
  Badge,
  exportTableToPdf,
  type TableColumn,
} from '@edg/ui';

import { authApi } from '../api/authApi';
import TenantFormModal from '../components/TenantFormModal';
import { useEntityCrud, type StatusFilter } from '../../../shared/hooks/useEntityCrud';
import { STATUS_FILTER_OPTIONS } from '../../../shared/constants';
import { TENANT_LOCALE_OPTIONS } from '../types';
import type { Tenant, TenantInput } from '../types';

const TenantPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');

  const { items, isLoading, isSaving, refetch, create, update, remove } = useEntityCrud<Tenant>({
    api: authApi,
    resource: 'tenants',
    label: 'Tenant',
    statusFilter,
  });

  const [modalItem, setModalItem] = useState<Tenant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Tenant | null>(null);

  const openCreate = () => {
    setModalItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: Tenant) => {
    setModalItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (form: TenantInput) => {
    const ok = modalItem ? await update(modalItem.id, form) : await create(form);
    if (ok) setIsModalOpen(false);
  };

  const localeLabel = (value: string): string => TENANT_LOCALE_OPTIONS.find(o => o.value === value)?.label ?? value;

  const columns: TableColumn<Tenant>[] = [
    { header: 'Nome', accessor: 'name', sortable: true },
    { header: 'Slug', accessor: 'slug', sortable: true },
    { header: 'Lingua', accessor: item => localeLabel(item.defaultLocale) },
    {
      header: 'Stato',
      accessor: item => <Badge variant={item.isActive ? 'success' : 'default'}>{item.isActive ? 'Attivo' : 'Disattivo'}</Badge>,
    },
    {
      header: 'Sistema',
      accessor: item => (item.isSystem ? <Badge variant='info'>Sistema</Badge> : null),
    },
  ];

  const handleExportPdf = () => {
    exportTableToPdf({
      filename: 'tenant',
      title: 'Tenant',
      columns: [
        { header: 'Nome', accessor: item => item.name },
        { header: 'Slug', accessor: item => item.slug },
        { header: 'Lingua', accessor: item => localeLabel(item.defaultLocale) },
        { header: 'Stato', accessor: item => (item.isActive ? 'Attivo' : 'Disattivo') },
        { header: 'Sistema', accessor: item => (item.isSystem ? 'Sì' : 'No') },
      ],
      data: items,
    });
  };

  return (
    <div className='space-y-6'>
      <PageHeader title='Tenant' subtitle='Aziende ospitate sulla piattaforma' onRefresh={refetch} isLoading={isLoading} />

      <div className='flex items-end justify-between gap-4'>
        <div className='w-48'>
          <Select
            label='Filtra per stato'
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onValueChange={v => setStatusFilter(v as StatusFilter)}
          />
        </div>
        <div className='flex gap-3'>
          <ExportPdfAction onClick={handleExportPdf} disabled={items.length === 0} />
          <CreateAction onClick={openCreate} label='Nuovo tenant' />
        </div>
      </div>

      <Table
        data={items}
        columns={columns}
        keyExtractor={item => item.id}
        isLoading={isLoading}
        emptyMessage='Nessun tenant presente'
        striped
        hoverable
        rowActions={{
          enabled: true,
          quickActions: {
            edit: { enabled: true, onEdit: openEdit },
            delete: {
              enabled: true,
              onDelete: item => setToDelete(item),
              canDelete: item => !item.isSystem,
              getItemName: item => item.name,
            },
          },
        }}
      />

      <TenantFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} isSaving={isSaving} item={modalItem} />

      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await remove(toDelete.id);
          setToDelete(null);
        }}
        title='Elimina tenant'
        message={`Eliminare il tenant "${toDelete?.name}"?`}
        variant='danger'
        confirmText='Elimina'
      />
    </div>
  );
};

export default TenantPage;
