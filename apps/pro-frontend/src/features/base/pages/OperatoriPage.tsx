// src/features/base/pages/OperatoriPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
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
  type SelectOption,
} from '@edg/ui';

import { listResource, systemApi } from '../api/systemApi';
import OperatoreFormModal from '../components/OperatoreFormModal';
import { STATUS_FILTER_OPTIONS } from '../constants';
import { useEntityCrud, type StatusFilter } from '../../../shared/hooks/useEntityCrud';
import type { Operatore, OperatoreInput, Reparto } from '../types';

const TUTTI_I_REPARTI = 'tutti';

const OperatoriPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [repartoFilter, setRepartoFilter] = useState<string>(TUTTI_I_REPARTI);
  const [repartoOptions, setRepartoOptions] = useState<SelectOption[]>([]);

  // Elenco reparti per il filtro: caricato una volta sola all'apertura pagina.
  useEffect(() => {
    listResource<Reparto>('reparti', { active: true, limit: 100 })
      .then(res =>
        setRepartoOptions([
          { value: TUTTI_I_REPARTI, label: 'Tutti i reparti' },
          ...(res.data ?? []).map(r => ({ value: String(r.idReparto), label: r.reparto })),
        ])
      )
      .catch(() => setRepartoOptions([{ value: TUTTI_I_REPARTI, label: 'Tutti i reparti' }]));
  }, []);

  const { items, isLoading, isSaving, refetch, create, update, remove } = useEntityCrud<Operatore>({
    api: systemApi,
    resource: 'operatori',
    label: 'Operatore',
    statusFilter,
    extraFilters: repartoFilter !== TUTTI_I_REPARTI ? { idReparto: Number(repartoFilter) } : undefined,
  });

  // idReparto → nome reparto: stessa lista già scaricata per il filtro,
  // riusata per mostrare il reparto in tabella senza un'altra chiamata.
  const repartoNameById = useMemo(
    () => new Map(repartoOptions.filter(o => o.value !== TUTTI_I_REPARTI).map(o => [o.value, o.label])),
    [repartoOptions]
  );

  const [modalItem, setModalItem] = useState<Operatore | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Operatore | null>(null);

  const handleSave = async (form: OperatoreInput) => {
    const ok = modalItem ? await update(modalItem.idOperatore, form) : await create(form);
    if (ok) setIsModalOpen(false);
  };

  const columns: TableColumn<Operatore>[] = [
    { header: 'Nome', accessor: item => `${item.cognome} ${item.nome}`, sortable: true },
    { header: 'Reparto', accessor: item => repartoNameById.get(String(item.idReparto)) ?? '—' },
    { header: 'Telefono', accessor: item => item.telefono ?? '—' },
    { header: 'Email', accessor: item => item.email ?? '—' },
    {
      header: 'Stato',
      accessor: item => <Badge variant={item.isActive ? 'success' : 'default'}>{item.isActive ? 'Attivo' : 'Disattivo'}</Badge>,
    },
  ];

  const handleExportPdf = () => {
    const statoLabel = STATUS_FILTER_OPTIONS.find(o => o.value === statusFilter)?.label ?? 'Tutti gli stati';
    const repartoLabel = repartoOptions.find(o => o.value === repartoFilter)?.label ?? 'Tutti i reparti';

    exportTableToPdf({
      filename: 'operatori',
      title: 'Operatori',
      subtitle: `${repartoLabel} · ${statoLabel}`,
      columns: [
        { header: 'Cognome e nome', accessor: item => `${item.cognome} ${item.nome}` },
        { header: 'Reparto', accessor: item => repartoNameById.get(String(item.idReparto)) ?? '—' },
        { header: 'Telefono', accessor: item => item.telefono ?? '—' },
        { header: 'Email', accessor: item => item.email ?? '—' },
        { header: 'Stato', accessor: item => (item.isActive ? 'Attivo' : 'Disattivo') },
      ],
      data: items,
    });
  };

  return (
    <div className='space-y-6'>
      <PageHeader title='Operatori' subtitle='Personale interno EDG' onRefresh={refetch} isLoading={isLoading} />

      <div className='flex items-end justify-between gap-4'>
        <div className='flex gap-4'>
          <div className='w-48'>
            <Select
              label='Filtra per stato'
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onValueChange={v => setStatusFilter(v as StatusFilter)}
            />
          </div>
          <div className='w-56'>
            <Select label='Filtra per reparto' options={repartoOptions} value={repartoFilter} onValueChange={setRepartoFilter} />
          </div>
        </div>
        <div className='flex gap-3'>
          <ExportPdfAction onClick={handleExportPdf} disabled={items.length === 0} />
          <CreateAction
            onClick={() => {
              setModalItem(null);
              setIsModalOpen(true);
            }}
            label='Nuovo operatore'
          />
        </div>
      </div>

      <Table
        data={items}
        columns={columns}
        keyExtractor={item => item.idOperatore}
        isLoading={isLoading}
        emptyMessage='Nessun operatore presente'
        striped
        hoverable
        rowActions={{
          enabled: true,
          quickActions: {
            edit: {
              enabled: true,
              onEdit: item => {
                setModalItem(item);
                setIsModalOpen(true);
              },
            },
            delete: {
              enabled: true,
              onDelete: item => setToDelete(item),
              getItemName: item => `${item.nome} ${item.cognome}`,
            },
          },
        }}
      />

      <OperatoreFormModal
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
          if (toDelete) await remove(toDelete.idOperatore);
          setToDelete(null);
        }}
        title='Elimina operatore'
        message={`Eliminare "${toDelete?.nome} ${toDelete?.cognome}"?`}
        variant='danger'
        confirmText='Elimina'
      />
    </div>
  );
};

export default OperatoriPage;
