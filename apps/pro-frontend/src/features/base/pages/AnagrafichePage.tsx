// src/features/base/pages/AnagrafichePage.tsx
//
// Collegamento cliente ↔ tenant (ADR058): per i clienti dell'anagrafica EDG
// (tipo cliente, rubrica del tenant di sistema) la colonna "Tenant collegato"
// e l'azione "Crea tenant", che apre il form del tenant precompilato. Solo
// per chi gestisce i tenant (sistema.tenant).
import React, { useMemo, useState } from 'react';
import {
  PageHeader,
  Table,
  ConfirmModal,
  CreateAction,
  ExportPdfAction,
  Select,
  Badge,
  DetailModal,
  Building2,
  useToast,
  exportTableToPdf,
  type TableColumn,
  type SelectOption,
  type DetailSection,
} from '@edg/ui';

import { useAuth } from '@edg/auth';

import AnagraficaFormModal from '../components/AnagraficaFormModal';
// Import diretto del form (non dall'indice della feature sistema, che porta
// con sé tutte le sue pagine): stesso form e stesse regole della pagina Tenant
import TenantFormModal from '../../sistema/components/TenantFormModal';
import { toSlug } from '../../sistema/utils/slug';
import type { TenantInput } from '../../sistema/types';
import { authApi } from '../api/authApi';
import { STATUS_FILTER_OPTIONS } from '../constants';
import { useEntityCrud, type StatusFilter } from '../../../shared/hooks/useEntityCrud';
import { systemApi } from '../api/systemApi';
import { useTenantDirectory } from '../api/useTenantDirectory';
import { useSettori } from '../api/useSettori';
import type { Anagrafica, AnagraficaInput, TipoAnagrafica } from '../types';
import { TIPO_ANAGRAFICA_LABELS } from '../types';

const TIPO_FILTER_OPTIONS: SelectOption[] = [
  { value: 'tutti', label: 'Tutti i tipi' },
  ...(Object.entries(TIPO_ANAGRAFICA_LABELS) as [TipoAnagrafica, string][]).map(([value, label]) => ({ value, label })),
];

const TENANT_FILTER_ALL = 'tutti';
const SETTORE_FILTER_ALL = 'tutti';

const AnagrafichePage: React.FC = () => {
  const [tipoFilter, setTipoFilter] = useState<string>('tutti');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [tenantFilter, setTenantFilter] = useState<string>(TENANT_FILTER_ALL);
  const [settoreFilter, setSettoreFilter] = useState<string>(SETTORE_FILTER_ALL);

  // Settore di attività (ADR059)
  const { settori, settoreName } = useSettori();
  const settoreFilterOptions: SelectOption[] = [
    { value: SETTORE_FILTER_ALL, label: 'Tutti i settori' },
    ...settori.map(s => ({ value: String(s.idSettore), label: s.settore })),
  ];

  const { tenants, allTenants, getTenant, tenantOfCliente, refetch: refetchTenants } = useTenantDirectory();
  const { hasPermission } = useAuth();
  const canManageTenants = hasPermission('sistema.tenant');
  const toast = useToast();

  // Cliente dell'anagrafica EDG: tipo cliente nella rubrica del tenant di sistema
  const isEdgCliente = (item: Anagrafica): boolean => item.tipo === 'cliente' && !!getTenant(item.idTenant)?.isSystem;

  // "Crea tenant" (ADR058): cliente di partenza e salvataggio
  const [tenantFor, setTenantFor] = useState<Anagrafica | null>(null);
  const [isTenantOpen, setIsTenantOpen] = useState(false);
  const [isTenantSaving, setIsTenantSaving] = useState(false);
  const tenantInitial = useMemo<Partial<TenantInput> | undefined>(
    () =>
      tenantFor
        ? { name: tenantFor.ragioneSociale, slug: toSlug(tenantFor.ragioneSociale), clienteUuid: tenantFor.uuidAnagrafica }
        : undefined,
    [tenantFor]
  );
  const takenClienti = useMemo(
    () => new Set(allTenants.filter(t => t.clienteUuid).map(t => t.clienteUuid as string)),
    [allTenants]
  );

  const openCreateTenant = (item: Anagrafica) => {
    setTenantFor(item);
    setIsTenantOpen(true);
  };

  const handleCreateTenant = async (form: TenantInput) => {
    setIsTenantSaving(true);
    try {
      await authApi.createResource('tenants', form);
      toast?.({ title: `Tenant "${form.name}" creato e collegato al cliente` });
      setIsTenantOpen(false);
      await refetchTenants();
    } catch (err) {
      toast?.danger({ title: 'Errore nella creazione del tenant', description: (err as Error).message });
    } finally {
      setIsTenantSaving(false);
    }
  };

  /** Tenant collegato, come badge (solo per i clienti EDG) */
  const linkedTenant = (item: Anagrafica): React.ReactNode => {
    if (!isEdgCliente(item)) return null;
    const tenant = tenantOfCliente(item.uuidAnagrafica);
    return tenant ? <Badge variant={tenant.isActive ? 'info' : 'default'}>{tenant.name}</Badge> : '—';
  };
  const tenantFilterOptions: SelectOption[] = [
    { value: TENANT_FILTER_ALL, label: 'Tutti i tenant' },
    ...tenants.map(t => ({ value: String(t.id), label: t.name })),
  ];

  const extraFilters: Record<string, string | number | boolean | undefined> = {};
  if (tipoFilter !== 'tutti') extraFilters.tipo = tipoFilter;
  if (tenantFilter !== TENANT_FILTER_ALL) extraFilters.idTenant = tenantFilter;
  if (settoreFilter !== SETTORE_FILTER_ALL) extraFilters.idSettore = settoreFilter;

  const { items, isLoading, isSaving, refetch, create, update, remove } = useEntityCrud<Anagrafica>({
    api: systemApi,
    resource: 'anagrafiche',
    label: 'Anagrafica',
    statusFilter,
    extraFilters: Object.keys(extraFilters).length > 0 ? extraFilters : undefined,
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
        { label: 'Settore', value: settoreName(item.idSettore) ?? '—' },
        { label: 'Tenant', value: getTenant(item.idTenant)?.name ?? '—' },
        ...(canManageTenants && isEdgCliente(item) ? [{ label: 'Tenant collegato', value: linkedTenant(item) }] : []),
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
    { header: 'Settore', accessor: item => settoreName(item.idSettore) ?? '—' },
    {
      header: 'Tenant',
      accessor: item => {
        const tenant = getTenant(item.idTenant);
        if (!tenant) return '—';
        // Il colore distingue a colpo d'occhio chi ha un tenant dedicato
        // (accesso proprio alla piattaforma) da chi è gestito direttamente
        // da Express Delivery (tenant di sistema, nessun accesso proprio).
        return <Badge variant={tenant.isSystem ? 'default' : 'info'}>{tenant.name}</Badge>;
      },
    },
    ...(canManageTenants ? [{ header: 'Tenant collegato', accessor: (item: Anagrafica) => linkedTenant(item) }] : []),
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
    const tenantLabel = tenantFilterOptions.find(o => o.value === tenantFilter)?.label ?? 'Tutti i tenant';
    const settoreLabel = settoreFilterOptions.find(o => o.value === settoreFilter)?.label ?? 'Tutti i settori';

    exportTableToPdf({
      filename: 'anagrafiche',
      title: 'Anagrafiche',
      subtitle: `${tipoLabel} · ${settoreLabel} · ${tenantLabel} · ${statoLabel}`,
      columns: [
        { header: 'Ragione sociale', accessor: item => item.ragioneSociale },
        { header: 'Tipo', accessor: item => TIPO_ANAGRAFICA_LABELS[item.tipo] },
        { header: 'Settore', accessor: item => settoreName(item.idSettore) ?? '—' },
        { header: 'Tenant', accessor: item => getTenant(item.idTenant)?.name ?? '—' },
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
      <PageHeader title='Anagrafiche' subtitle='Partner e clienti' onRefresh={refetch} isLoading={isLoading} />

      <div className='flex items-end justify-between gap-4'>
        <div className='flex flex-wrap gap-4'>
          <div className='w-56'>
            <Select label='Filtra per tipo' options={TIPO_FILTER_OPTIONS} value={tipoFilter} onValueChange={setTipoFilter} />
          </div>
          <div className='w-56'>
            <Select label='Filtra per settore' options={settoreFilterOptions} value={settoreFilter} onValueChange={setSettoreFilter} />
          </div>
          <div className='w-56'>
            <Select label='Filtra per tenant' options={tenantFilterOptions} value={tenantFilter} onValueChange={setTenantFilter} />
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
              // Collegata a un tenant: prima va scollegata (ADR058, lo impone anche system-service)
              canDelete: item => !tenantOfCliente(item.uuidAnagrafica),
              getItemName: item => item.ragioneSociale,
            },
          },
          actions: item =>
            canManageTenants && isEdgCliente(item) && !tenantOfCliente(item.uuidAnagrafica)
              ? [
                  {
                    id: 'create-tenant',
                    label: 'Crea tenant',
                    icon: <Building2 className='w-4 h-4' />,
                    onClick: () => openCreateTenant(item),
                  },
                ]
              : [],
        }}
      />

      <AnagraficaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
        item={modalItem}
      />

      <TenantFormModal
        isOpen={isTenantOpen}
        onClose={() => setIsTenantOpen(false)}
        onSave={handleCreateTenant}
        isSaving={isTenantSaving}
        item={null}
        initial={tenantInitial}
        takenClienti={takenClienti}
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
