// src/features/base/components/LookupTableTab.tsx
//
// Scheda di una tabella di base (Reparti, Settori, ...): elenco, creazione,
// modifica, attiva/disattiva ed eliminazione di record fatti di un solo nome.
// Ogni tabella è una configurazione (LookupTableConfig), non un componente
// copiato: aggiungerne una nuova è dichiararla in TabellePage.
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

import { useEntityCrud } from '../../../shared/hooks/useEntityCrud';
import { systemApi } from '../api/systemApi';

/** Record di una tabella di base: un id, un nome, lo stato */
type LookupRecord = { isActive: boolean } & Record<string, unknown>;

export interface LookupTableConfig {
  /** Risorsa di system-service (es. 'reparti') */
  resource: string;
  /** Campo id e campo nome nel record (es. 'idReparto', 'reparto') */
  idKey: string;
  nameKey: string;
  /** Nome della cosa, minuscolo e maschile (es. 'reparto'): compone i messaggi */
  noun: string;
  /** Plurale con maiuscola, per titolo ed esportazione (es. 'Reparti') */
  plural: string;
  /** Spiegazione breve sopra la tabella (facoltativa) */
  hint?: string;
}

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const LookupTableTab: React.FC<{ config: LookupTableConfig }> = ({ config }) => {
  const { resource, idKey, nameKey, noun, plural, hint } = config;
  const label = capitalize(noun);

  const { items, isLoading, isSaving, create, update, remove } = useEntityCrud<LookupRecord>({
    api: systemApi,
    resource,
    label,
    statusFilter: 'all', // tabella di base: pochi record, ha senso vederli tutti
  });

  const [modalItem, setModalItem] = useState<LookupRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [toDelete, setToDelete] = useState<LookupRecord | null>(null);

  const idOf = (item: LookupRecord): number => item[idKey] as number;
  const nameOf = (item: LookupRecord | null): string => (item ? String(item[nameKey] ?? '') : '');

  const openCreate = () => {
    setModalItem(null);
    setName('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEdit = (item: LookupRecord) => {
    setModalItem(item);
    setName(nameOf(item));
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const body = { [nameKey]: name.trim(), isActive };
    const ok = modalItem ? await update(idOf(modalItem), body) : await create(body);
    if (ok) setIsModalOpen(false);
  };

  const columns: TableColumn<LookupRecord>[] = [
    { header: label, accessor: item => nameOf(item), sortable: true },
    {
      header: 'Stato',
      accessor: item => (
        <Badge variant={item.isActive ? 'success' : 'default'}>{item.isActive ? 'Attivo' : 'Disattivo'}</Badge>
      ),
    },
  ];

  const handleExportPdf = () => {
    exportTableToPdf({
      filename: resource,
      title: plural,
      columns: [
        { header: label, accessor: item => nameOf(item) },
        { header: 'Stato', accessor: item => (item.isActive ? 'Attivo' : 'Disattivo') },
      ],
      data: items,
    });
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-end justify-between gap-3'>
        <p className='text-sm text-text-secondary'>{hint}</p>
        <div className='flex shrink-0 gap-3'>
          <ExportPdfAction onClick={handleExportPdf} disabled={items.length === 0} />
          <CreateAction onClick={openCreate} label={`Nuovo ${noun}`} />
        </div>
      </div>

      <Table
        data={items}
        columns={columns}
        keyExtractor={item => idOf(item)}
        isLoading={isLoading}
        emptyMessage={`Nessun ${noun} presente`}
        striped
        hoverable
        rowActions={{
          enabled: true,
          quickActions: {
            edit: { enabled: true, onEdit: openEdit },
            delete: {
              enabled: true,
              onDelete: item => setToDelete(item),
              getItemName: item => nameOf(item),
            },
          },
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalItem ? `Modifica ${noun}` : `Nuovo ${noun}`}
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
          <Input label={`Nome ${noun}`} value={name} onChange={e => setName(e.target.value)} maxLength={64} required />
          <Switch label='Attivo' checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await remove(idOf(toDelete));
          setToDelete(null);
        }}
        title={`Elimina ${noun}`}
        message={`Eliminare il ${noun} "${nameOf(toDelete)}"? Se è in uso viene solo disattivato.`}
        variant='danger'
        confirmText='Elimina'
      />
    </div>
  );
};

export default LookupTableTab;
