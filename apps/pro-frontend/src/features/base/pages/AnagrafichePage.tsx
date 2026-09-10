// src/features/base/pages/AnagrafichePage.tsx
import React, { useState } from 'react';
import { useAuth } from '@edg/auth';
import {
  PageHeader,
  Table,
  ConfirmModal,
  CreateAction,
  ExportPdfAction,
  Select,
  Badge,
  DetailModal,
  exportTableToPdf,
  type TableColumn,
  type SelectOption,
  type DetailSection,
} from '@edg/ui';

import AnagraficaFormModal from '../components/AnagraficaFormModal';
import { STATUS_FILTER_OPTIONS } from '../constants';
import { useEntityCrud, type StatusFilter } from '../hooks/useEntityCrud';
import type { Anagrafica, AnagraficaInput, TipoAnagrafica } from '../types';
import { TIPO_ANAGRAFICA_LABELS } from '../types';

const TIPO_FILTER_OPTIONS: SelectOption[] = [
  { value: 'tutti', label: 'Tutti i tipi' },
  ...(Object.entries(TIPO_ANAGRAFICA_LABELS) as [TipoAnagrafica, string][]).map(([value, label]) => ({ value, label })),
];

const AnagrafichePage: React.FC = () => {
  const { account } = useAuth();
  const currentTenantId = account?.tenantId ?? 0;

  const [tipoFilter, setTipoFilter] = useState<string>('tutti');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');

  const { items, isLoading, isSaving, refetch, create, update, remove } = useEntityCrud<Anagrafica>({
    resource: 'anagrafiche',
    label: 'Anagrafica',
    statusFilter,
    extraFilters: tipoFilter !== 'tutti' ? { tipo: tipoFilter } : undefined,
  });

  const [modalItem, setModalItem] = useState<Anagrafica | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Anagrafica | null>(null);
  const [detailItem, setDetailItem] = useState<Anagrafica | null>(null);

  const handleSave = async (form: AnagraficaInput) => {
    const ok = modalItem ? await update(modalItem.idAnagrafica, form) : await create(form);
    if (ok) setIsModalOpen(false);
  };

  const detailSections = (item: Anagrafica): DetailSection[] => [
    {
      fields: [
        { label: 'Tipo', value: TIPO_ANAGRAFICA_LABELS[item.tipo] },
        { label: 'Stato', value: <Badge variant={item.isActive ? 'success' : 'default'}>{item.isActive ? 'Attivo' : 'Disattivo'}</Badge> },
      ],
    },
    {
      title: 'Dati fiscali',
      fields: [
        { label: 'Partita IVA', value: item.partitaIva },
        { label: 'Codice fiscale', value: item.codiceFiscale },
      ],
    },
    {
      title: 'Indirizzo',
      fields: [
        { label: 'Indirizzo', value: item.indirizzo },
        { label: 'CAP', value: item.cap },
        { label: 'Città', value: item.citta },
        { label: 'Sigla provincia', value: item.provincia },
      ],
    },
    {
      title: 'Contatti',
      fields: [
        { label: 'Telefono', value: item.telefono },
        { label: 'Email', value: item.email },
        { label: 'Referente', value: item.referente },
      ],
    },
    {
      title: 'Note',
      fields: [{ label: 'Note', value: item.note }],
    },
  ];

  const columns: TableColumn<Anagrafica>[] = [
    {
      header: 'Ragione sociale',
      accessor: 'ragioneSociale',
      sortable: true,
      clickable: true,
      onCellClick: item => setDetailItem(item),
    },
    { header: 'Tipo', accessor: item => TIPO_ANAGRAFICA_LABELS[item.tipo] },
    { header: 'Città', accessor: item => item.citta ?? '—' },
    { header: 'Referente', accessor: item => item.referente ?? '—' },
    {
      header: 'Stato',
      accessor: item => <Badge variant={item.isActive ? 'success' : 'default'}>{item.isActive ? 'Attivo' : 'Disattivo'}</Badge>,
    },
  ];

  const handleExportPdf = () => {
    const tipoLabel = TIPO_FILTER_OPTIONS.find(o => o.value === tipoFilter)?.label ?? 'Tutti i tipi';
    const statoLabel = STATUS_FILTER_OPTIONS.find(o => o.value === statusFilter)?.label ?? 'Tutti gli stati';

    exportTableToPdf({
      filename: 'anagrafiche',
      title: 'Anagrafiche',
      subtitle: `${tipoLabel} · ${statoLabel}`,
      columns: [
        { header: 'Ragione sociale', accessor: item => item.ragioneSociale },
        { header: 'Tipo', accessor: item => TIPO_ANAGRAFICA_LABELS[item.tipo] },
        { header: 'Partita IVA', accessor: item => item.partitaIva ?? '—' },
        { header: 'Città', accessor: item => item.citta ?? '—' },
        { header: 'Prov.', accessor: item => item.provincia ?? '—' },
        { header: 'Telefono', accessor: item => item.telefono ?? '—' },
        { header: 'Email', accessor: item => item.email ?? '—' },
        { header: 'Stato', accessor: item => (item.isActive ? 'Attivo' : 'Disattivo') },
      ],
      data: items,
    });
  };

  return (
    <div className='space-y-6'>
      <PageHeader title='Anagrafiche' subtitle='Partner, clienti e agenti' onRefresh={refetch} isLoading={isLoading} />

      <div className='flex items-end justify-between gap-4'>
        <div className='flex gap-4'>
          <div className='w-56'>
            <Select label='Filtra per tipo' options={TIPO_FILTER_OPTIONS} value={tipoFilter} onValueChange={setTipoFilter} />
          </div>
          <div className='w-48'>
            <Select
              label='Filtra per stato'
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onValueChange={v => setStatusFilter(v as StatusFilter)}
            />
          </div>
        </div>
        <div className='flex gap-3'>
          <ExportPdfAction onClick={handleExportPdf} disabled={items.length === 0} />
          <CreateAction
            onClick={() => {
              setModalItem(null);
              setIsModalOpen(true);
            }}
            label='Nuova anagrafica'
          />
        </div>
      </div>

      <Table
        data={items}
        columns={columns}
        keyExtractor={item => item.idAnagrafica}
        isLoading={isLoading}
        emptyMessage='Nessuna anagrafica presente'
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
              getItemName: item => item.ragioneSociale,
            },
          },
        }}
      />

      <AnagraficaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
        item={modalItem}
        currentTenantId={currentTenantId}
      />

      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await remove(toDelete.idAnagrafica);
          setToDelete(null);
        }}
        title='Elimina anagrafica'
        message={`Eliminare "${toDelete?.ragioneSociale}"?`}
        variant='danger'
        confirmText='Elimina'
      />

      {detailItem && (
        <DetailModal
          isOpen={!!detailItem}
          onClose={() => setDetailItem(null)}
          title={detailItem.ragioneSociale}
          sections={detailSections(detailItem)}
          onEdit={() => {
            setModalItem(detailItem);
            setDetailItem(null);
            setIsModalOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default AnagrafichePage;
