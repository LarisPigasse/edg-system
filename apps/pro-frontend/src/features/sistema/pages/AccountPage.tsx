// src/features/sistema/pages/AccountPage.tsx
import React, { useEffect, useState } from 'react';
import {
  PageHeader,
  Table,
  ConfirmModal,
  CreateAction,
  ExportPdfAction,
  Select,
  Input,
  Badge,
  StatTile,
  useToast,
  exportTableToPdf,
  Trash2,
  Lock,
  Unlock,
  type TableColumn,
  type Action,
} from '@edg/ui';

import { apiFetch } from '@edg/auth';

import { authApi } from '../api/authApi';
import AccountFormModal from '../components/AccountFormModal';
import BlockUserModal from '../components/BlockUserModal';
import { useEntityDirectory } from '../api/useEntityDirectory';
import { unblockUser, isAccountBlocked } from '../api/accountActions';
import { listRoles } from '../api/roleActions';
import { roleLabel } from '../constants/roleLabels';
import { useEntityCrud, type StatusFilter } from '../../../shared/hooks/useEntityCrud';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { STATUS_FILTER_OPTIONS } from '../../../shared/constants';
import { ACCOUNT_TYPE_OPTIONS } from '../types';
import type { Account, AccountInput, Tenant } from '../types';
import type { ApiResponse } from '../../../shared/types/api';

interface AccountStats {
  total: number;
  active: number;
  inactive: number;
  blocked: number;
}

const TENANT_FILTER_ALL = 'all';
const ROLE_FILTER_ALL = 'all';

const AccountPage: React.FC = () => {
  const toast = useToast();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [tenantFilter, setTenantFilter] = useState<string>(TENANT_FILTER_ALL);
  const [tenantOptions, setTenantOptions] = useState<{ value: string; label: string }[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>(ROLE_FILTER_ALL);
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const [stats, setStats] = useState<AccountStats | null>(null);

  // Combina i due filtri a scelta libera (nessuno, uno solo, o entrambi):
  // stesso schema usato in AnagrafichePage per tipo+tenant.
  const extraFilters: Record<string, string | number | boolean | undefined> = {};
  if (tenantFilter !== TENANT_FILTER_ALL) extraFilters.tenantId = tenantFilter;
  if (roleFilter !== ROLE_FILTER_ALL) extraFilters.roleId = roleFilter;

  const { items, isLoading, isSaving, refetch, create, update, toggleActive } = useEntityCrud<Account>({
    api: authApi,
    resource: 'accounts',
    label: 'Account',
    statusFilter,
    search: debouncedSearch,
    extraFilters: Object.keys(extraFilters).length > 0 ? extraFilters : undefined,
  });

  // Etichette leggibili per la colonna "Collegato a" (stesso elenco usato dal
  // selettore nel form, vedi EntityLinkSelect) - versione senza suffisso
  // tipo: qui non serve, la colonna "Tipo" lo mostra già.
  const { getShortLabel: getEntityLabel } = useEntityDirectory();

  // Non e' una collezione (nessun array da paginare): bypassa il client CRUD
  // generico e chiama direttamente l'endpoint riassuntivo.
  const loadStats = () => {
    apiFetch<ApiResponse<AccountStats>>('/auth/accounts/stats')
      .then(res => res.data && setStats(res.data))
      .catch(() => {});
  };

  useEffect(loadStats, []);

  // Tenant per il filtro: stessa fonte usata dal form (solo tenant attivi).
  useEffect(() => {
    authApi
      .listResource<Tenant>('tenants', { active: true, limit: 100 })
      .then(res =>
        setTenantOptions([
          { value: TENANT_FILTER_ALL, label: 'Tutti i tenant' },
          ...(res.data ?? []).map(t => ({ value: String(t.id), label: t.name })),
        ])
      )
      .catch(() => setTenantOptions([{ value: TENANT_FILTER_ALL, label: 'Tutti i tenant' }]));
  }, []);

  // Ruoli per il filtro: stesso endpoint usato dalla pagina Ruoli.
  useEffect(() => {
    listRoles()
      .then(res =>
        setRoleOptions([
          { value: ROLE_FILTER_ALL, label: 'Tutti i ruoli' },
          ...(res.data ?? []).map(r => ({ value: String(r.id), label: roleLabel(r.name) })),
        ])
      )
      .catch(() => setRoleOptions([{ value: ROLE_FILTER_ALL, label: 'Tutti i ruoli' }]));
  }, []);

  const [modalItem, setModalItem] = useState<Account | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toToggle, setToToggle] = useState<Account | null>(null);
  const [toBlock, setToBlock] = useState<Account | null>(null);
  const [toHardDelete, setToHardDelete] = useState<Account | null>(null);
  const [isHardDeleting, setIsHardDeleting] = useState(false);

  const openCreate = () => {
    setModalItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: Account) => {
    setModalItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (form: AccountInput) => {
    const ok = modalItem ? await update(modalItem.id, form) : await create(form);
    if (ok) {
      setIsModalOpen(false);
      loadStats();
    }
  };

  const handleToggleClick = async (item: Account) => {
    if (item.isActive) {
      // Disattivare revoca subito le sessioni attive: merita una conferma.
      setToToggle(item);
    } else {
      await toggleActive(item.id);
      loadStats();
    }
  };

  // Blocco "forte" (motivo + durata di riferimento): distinto dal semplice
  // Disattiva/Attiva, vedi isAccountBlocked in api/accountActions.ts.
  const handleUnblock = async (item: Account) => {
    try {
      const res = await unblockUser(item.id);
      toast?.({ title: res.message ?? 'Utente sbloccato' });
      await refetch();
      loadStats();
    } catch (err) {
      toast?.danger({ title: 'Errore nello sblocco', description: (err as Error).message });
    }
  };

  // Eliminazione fisica: distinta dal soft-delete (toggle) di useEntityCrud,
  // disponibile solo per account mai collegati a un'entità operativa — vedi
  // hardDeleteAccount lato backend. Non passa dal client CRUD generico.
  const handleHardDelete = async () => {
    if (!toHardDelete) return;
    setIsHardDeleting(true);
    try {
      const res = await apiFetch<ApiResponse<null>>(`/auth/accounts/${toHardDelete.id}/hard`, { method: 'DELETE' });
      toast?.({ title: res.message ?? 'Account eliminato definitivamente' });
      await refetch();
      loadStats();
    } catch (err) {
      toast?.danger({ title: "Errore nell'eliminazione", description: (err as Error).message });
    } finally {
      setIsHardDeleting(false);
      setToHardDelete(null);
    }
  };

  const accountTypeLabel = (value: string): string => ACCOUNT_TYPE_OPTIONS.find(o => o.value === value)?.label ?? value;

  // "Bloccato" e' uno stato distinto da "Disattivo": stessa disattivazione,
  // ma con motivo/durata registrati (vedi isAccountBlocked). Un unico punto
  // di verita' per tabella, PDF e scelta delle azioni riga.
  const accountStatusLabel = (item: Account): string => {
    if (isAccountBlocked(item)) return 'Bloccato';
    return item.isActive ? 'Attivo' : 'Disattivo';
  };

  const columns: TableColumn<Account>[] = [
    { header: 'Email', accessor: 'email', sortable: true },
    { header: 'Tipo', accessor: item => accountTypeLabel(item.accountType) },
    { header: 'Tenant', accessor: item => item.tenant?.name ?? '—' },
    { header: 'Ruolo', accessor: item => (item.role?.name ? roleLabel(item.role.name) : '—') },
    { header: 'Collegato a', accessor: item => getEntityLabel(item.accountType, item.entityId) ?? '—' },
    {
      header: 'Stato',
      accessor: item => {
        const label = accountStatusLabel(item);
        const variant = label === 'Bloccato' ? 'danger' : item.isActive ? 'success' : 'default';
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
  ];

  const handleExportPdf = () => {
    exportTableToPdf({
      filename: 'account',
      title: 'Account',
      columns: [
        { header: 'Email', accessor: item => item.email },
        { header: 'Tipo', accessor: item => accountTypeLabel(item.accountType) },
        { header: 'Tenant', accessor: item => item.tenant?.name ?? '—' },
        { header: 'Ruolo', accessor: item => (item.role?.name ? roleLabel(item.role.name) : '—') },
        { header: 'Collegato a', accessor: item => getEntityLabel(item.accountType, item.entityId) ?? '—' },
        { header: 'Stato', accessor: item => accountStatusLabel(item) },
      ],
      data: items,
    });
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Account'
        subtitle='Utenti abilitati alla piattaforma'
        onRefresh={refetch}
        isLoading={isLoading}
        actions={
          stats && (
            <>
              <StatTile value={stats.total} label='Totale' />
              <StatTile value={stats.active} label='Attivi' tone='success' />
              <StatTile value={stats.inactive} label='Non attivi' tone='warning' />
              <StatTile value={stats.blocked} label='Bloccati' tone='danger' />
            </>
          )
        }
      />

      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div className='flex flex-wrap items-end gap-4'>
          <div className='w-64'>
            <Input label='Cerca' value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          </div>
          <div className='w-48'>
            <Select
              label='Filtra per stato'
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onValueChange={v => setStatusFilter(v as StatusFilter)}
            />
          </div>
          <div className='w-56'>
            <Select label='Filtra per tenant' options={tenantOptions} value={tenantFilter} onValueChange={setTenantFilter} />
          </div>
          <div className='w-48'>
            <Select label='Filtra per ruolo' options={roleOptions} value={roleFilter} onValueChange={setRoleFilter} />
          </div>
        </div>
        <div className='flex gap-3'>
          <ExportPdfAction onClick={handleExportPdf} disabled={items.length === 0} />
          <CreateAction onClick={openCreate} label='Nuovo account' />
        </div>
      </div>

      <Table
        data={items}
        columns={columns}
        keyExtractor={item => item.id}
        isLoading={isLoading}
        emptyMessage='Nessun account presente'
        striped
        hoverable
        rowActions={{
          enabled: true,
          quickActions: {
            edit: { enabled: true, onEdit: openEdit },
          },
          actions: item => {
            const list: Action[] = [];

            // "Bloccato" ha una sola via d'uscita: Sblocca (pulisce anche
            // blockedUntil/blockReason). Il semplice Attiva resterebbe
            // incoerente con le statistiche, che guardano proprio quei campi.
            if (isAccountBlocked(item)) {
              list.push({
                id: 'unblock',
                label: 'Sblocca',
                icon: <Unlock className='w-4 h-4' />,
                variant: 'success',
                onClick: () => handleUnblock(item),
              });
            } else {
              list.push({
                id: 'toggle',
                label: item.isActive ? 'Disattiva' : 'Attiva',
                variant: item.isActive ? 'danger' : 'success',
                onClick: () => handleToggleClick(item),
              });
              // Disponibile anche da account gia' disattivato: puo' essere
              // stato disattivato per un motivo qualsiasi e solo in seguito
              // riconosciuto come violazione da formalizzare con motivo/durata.
              list.push({
                id: 'block',
                label: 'Blocca',
                icon: <Lock className='w-4 h-4' />,
                variant: 'danger',
                onClick: () => setToBlock(item),
              });
            }

            // Eliminabile definitivamente solo se non e' mai stato collegato
            // a un'entita' operativa (entityId nullo): un account creato per
            // errore non deve restare per sempre.
            if (!item.entityId) {
              list[list.length - 1].divider = true;
              list.push({
                id: 'hard-delete',
                label: 'Elimina definitivamente',
                icon: <Trash2 className='w-4 h-4' />,
                variant: 'danger',
                onClick: () => setToHardDelete(item),
              });
            }
            return list;
          },
        }}
      />

      <AccountFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
        item={modalItem}
        accounts={items}
      />

      <BlockUserModal
        isOpen={!!toBlock}
        onClose={() => setToBlock(null)}
        onBlocked={() => {
          refetch();
          loadStats();
        }}
        account={toBlock ? { id: toBlock.id, email: toBlock.email } : null}
      />

      <ConfirmModal
        isOpen={!!toToggle}
        onClose={() => setToToggle(null)}
        onConfirm={async () => {
          if (toToggle) {
            await toggleActive(toToggle.id);
            loadStats();
          }
          setToToggle(null);
        }}
        title='Disattiva account'
        message={`Disattivare l'account "${toToggle?.email}"? Le sue sessioni attive verranno revocate immediatamente.`}
        variant='danger'
        confirmText='Disattiva'
      />

      <ConfirmModal
        isOpen={!!toHardDelete}
        onClose={() => setToHardDelete(null)}
        onConfirm={handleHardDelete}
        isLoading={isHardDeleting}
        title='Elimina definitivamente'
        message={`Eliminare in modo permanente e irreversibile l'account "${toHardDelete?.email}"? A differenza della disattivazione, il record verrà rimosso e non potrà essere recuperato.`}
        variant='danger'
        confirmText='Elimina definitivamente'
      />
    </div>
  );
};

export default AccountPage;
