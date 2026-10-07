// src/features/sistema/pages/TenantPage.tsx
import React, { useMemo, useState } from 'react';
import {
  PageHeader,
  Table,
  ConfirmModal,
  CreateAction,
  ExportPdfAction,
  Select,
  Badge,
  Puzzle,
  exportTableToPdf,
  type TableColumn,
} from '@edg/ui';
import { useAuth } from '@edg/auth';

import { authApi } from '../api/authApi';
import { TenantModulesModal } from '../components/tenant';
import TenantFormModal from '../components/TenantFormModal';
import { useEdgClienti } from '../api/useEdgClienti';
import { useEntityCrud, type StatusFilter } from '../../../shared/hooks/useEntityCrud';
import { STATUS_FILTER_OPTIONS } from '../../../shared/constants';
import { TENANT_LOCALE_OPTIONS } from '../types';
import type { Tenant, TenantInput } from '../types';

const TenantPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  // ADR049-050: l'admin EDG crea e modifica i tenant, ma l'eliminazione resta a root
  const { isRoot, hasPermission } = useAuth();
  const canManageModules = hasPermission('sistema.moduli');
  // Moduli del tenant (ADR048): finestra larga sopra la lista
  const [modulesOf, setModulesOf] = useState<Tenant | null>(null);

  const { items, isLoading, isSaving, refetch, create, update, remove } = useEntityCrud<Tenant>({
    api: authApi,
    resource: 'tenants',
    label: 'Tenant',
    statusFilter,
  });

  const [modalItem, setModalItem] = useState<Tenant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Tenant | null>(null);

  // Clienti dell'anagrafica EDG collegati (ADR058): nome in tabella e, nel
  // form, esclusione di quelli già collegati ad altri tenant
  const { clienteName, settoreOfCliente } = useEdgClienti();
  const takenClienti = useMemo(
    () =>
      new Set(
        items.filter(t => t.clienteUuid && t.id !== modalItem?.id).map(t => t.clienteUuid as string)
      ),
    [items, modalItem]
  );

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
    // Settore del cliente collegato (ADR059): sta sull'anagrafica, non sul tenant
    { header: 'Settore', accessor: item => settoreOfCliente(item.clienteUuid) ?? '—' },
    {
      header: 'Cliente',
      accessor: item =>
        item.clienteUuid ? (clienteName(item.clienteUuid) ?? <span className='text-text-secondary'>non in anagrafica</span>) : '—',
    },
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
        { header: 'Cliente', accessor: item => clienteName(item.clienteUuid) ?? '—' },
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
              enabled: isRoot,
              onDelete: item => setToDelete(item),
              canDelete: item => !item.isSystem,
              getItemName: item => item.name,
            },
          },
          actions: item =>
            canManageModules ? [{ id: 'modules', label: 'Moduli', icon: <Puzzle className='w-4 h-4' />, onClick: () => setModulesOf(item) }] : [],
        }}
      />

      <TenantModulesModal
        isOpen={!!modulesOf}
        onClose={() => setModulesOf(null)}
        tenant={modulesOf}
        settore={settoreOfCliente(modulesOf?.clienteUuid)}
      />

      <TenantFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
        item={modalItem}
        takenClienti={takenClienti}
      />

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
