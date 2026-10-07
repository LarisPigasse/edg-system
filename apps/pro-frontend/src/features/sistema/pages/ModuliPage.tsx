// src/features/sistema/pages/ModuliPage.tsx
//
// SISTEMA → Moduli (ADR047-048): catalogo dei moduli attivabili per i tenant.
// Solo root: il catalogo descrive cosa esiste nel codice; le attivazioni per
// tenant (prove, contratti) si gestiscono dalla pagina del tenant.
//
// Un modulo già attivato, o richiesto da un altro, non si elimina: si porta a
// "Dismesso". Il pulsante di eliminazione compare solo quando è possibile.
import React, { useMemo, useState } from 'react';
import {
  PageHeader,
  Table,
  ConfirmModal,
  CreateAction,
  Badge,
  ModuleBrand,
  Palette,
  TableLink,
  type TableColumn,
} from '@edg/ui';

import ModuleFormModal from '../components/ModuleFormModal';
import ModuleDetailModal from '../components/ModuleDetailModal';
import { ModuleBrandingModal } from '../components/module-brand';
import { moduleImages } from '../../../assets/moduli';
import { useModuleCatalog } from '../hooks/useModuleCatalog';
import { MODULE_STATUS, moduleNames, productLabel, showcaseLabel } from '../utils/moduleFormat';
import type { CatalogModule, CatalogModuleInput } from '../types/modules';
import type { ModuleBranding } from '@edg/ui';

const ModuliPage: React.FC = () => {
  const { items, isLoading, isSaving, refetch, save, saveBranding, remove } = useModuleCatalog();

  const [modalItem, setModalItem] = useState<CatalogModule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CatalogModule | null>(null);
  // Scheda e aspetto: la chiave resta impostata durante la chiusura (animazione)
  const [detailKey, setDetailKey] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [brandingItem, setBrandingItem] = useState<CatalogModule | null>(null);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);

  // Dal catalogo aggiornato: dopo un salvataggio la scheda mostra i dati nuovi
  const detailItem = useMemo(() => items.find(m => m.key === detailKey) ?? null, [items, detailKey]);

  // Ordinati per prodotto e nome: i moduli dello stesso prodotto restano vicini
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.product.localeCompare(b.product) || a.name.localeCompare(b.name)),
    [items]
  );

  /** Chiavi richieste da almeno un altro modulo */
  const required = useMemo(() => new Set(items.flatMap(m => m.dependencies ?? [])), [items]);

  const canDelete = (m: CatalogModule): boolean => Number(m.activationCount ?? 0) === 0 && !required.has(m.key);

  const openCreate = () => {
    setModalItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: CatalogModule) => {
    setModalItem(item);
    setIsModalOpen(true);
  };

  const openDetail = (item: CatalogModule) => {
    setDetailKey(item.key);
    setIsDetailOpen(true);
  };

  const openBranding = (item: CatalogModule) => {
    setBrandingItem(item);
    setIsBrandingOpen(true);
  };

  const handleSaveBranding = async (branding: ModuleBranding) => {
    if (!brandingItem) return;
    const ok = await saveBranding(brandingItem.key, branding);
    if (ok) setIsBrandingOpen(false);
  };

  const handleSave = async (input: CatalogModuleInput) => {
    const ok = await save(modalItem?.key ?? null, input);
    if (ok) setIsModalOpen(false);
  };

  const columns: TableColumn<CatalogModule>[] = [
    {
      header: 'Modulo',
      accessor: item => (
        <div className='flex items-center gap-3'>
          <ModuleBrand element='icon' size='sm' name={item.name} branding={item.branding} images={moduleImages(item.key)} />
          <div className='flex flex-col'>
            <TableLink onClick={() => openDetail(item)} title='Apri la scheda del modulo' className='font-medium'>
              {item.name}
            </TableLink>
            {item.description && <span className='text-xs text-text-secondary whitespace-normal'>{item.description}</span>}
          </div>
        </div>
      ),
    },
    { header: 'Chiave', accessor: item => <code className='text-xs'>{item.key}</code> },
    { header: 'Versione', accessor: item => <span className='tabular-nums'>{item.version}</span> },
    { header: 'Prodotto', accessor: item => productLabel(item.product) },
    {
      header: 'Richiede',
      accessor: item => (item.dependencies?.length ? moduleNames(item.dependencies, items) : '—'),
    },
    {
      header: 'Stato',
      accessor: item => (
        <Badge size='sm' variant={MODULE_STATUS[item.status].variant}>
          {MODULE_STATUS[item.status].label}
        </Badge>
      ),
    },
    { header: 'Vetrina', accessor: item => (item.showcase ? showcaseLabel(item) : '—') },
    { header: 'Prova', accessor: item => `${item.trialDays} gg` },
    { header: 'Attivazioni', accessor: item => Number(item.activationCount ?? 0) },
  ];

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Moduli'
        subtitle='Catalogo dei moduli attivabili per i tenant'
        onRefresh={refetch}
        isLoading={isLoading}
      />

      <div className='flex items-end justify-between gap-4'>
        <p className='text-sm text-text-secondary'>
          Le prove e le attivazioni per ogni cliente si gestiscono dalla pagina del tenant.
        </p>
        <CreateAction onClick={openCreate} label='Nuovo modulo' />
      </div>

      <Table
        data={sorted}
        columns={columns}
        keyExtractor={item => item.key}
        isLoading={isLoading}
        emptyMessage='Nessun modulo nel catalogo'
        striped
        hoverable
        rowActions={{
          enabled: true,
          quickActions: {
            edit: { enabled: true, onEdit: openEdit },
            delete: {
              enabled: true,
              onDelete: item => setToDelete(item),
              canDelete,
              getItemName: item => item.name,
            },
          },
          actions: item => [{ id: 'branding', label: 'Aspetto', icon: <Palette className='w-4 h-4' />, onClick: () => openBranding(item) }],
        }}
      />

      <ModuleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
        item={modalItem}
        catalog={items}
      />

      <ModuleDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        item={detailItem}
        catalog={items}
        onEdit={item => {
          setIsDetailOpen(false);
          openEdit(item);
        }}
        onEditBranding={item => {
          setIsDetailOpen(false);
          openBranding(item);
        }}
      />

      <ModuleBrandingModal
        isOpen={isBrandingOpen}
        onClose={() => setIsBrandingOpen(false)}
        item={brandingItem}
        onSave={handleSaveBranding}
        isSaving={isSaving}
      />

      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await remove(toDelete);
          setToDelete(null);
        }}
        title='Elimina modulo'
        message={`Eliminare "${toDelete?.name}" dal catalogo? Non è mai stato attivato: l'eliminazione non tocca nessun tenant.`}
        variant='danger'
        confirmText='Elimina'
      />
    </div>
  );
};

export default ModuliPage;
