// src/features/sistema/pages/RuoliPage.tsx
//
// Gestione permessi dei ruoli (ADR024). Per scelta esplicita non è una
// risorsa CRUD: i 4 ruoli seedati (root/admin/operatore/guest) sono fissi,
// qui si modificano solo i permessi di quelli diversi da root — stesso
// schema "lista + comando mirato" di SessioniPage (bypassa useEntityCrud,
// vedi roleActions.ts).
//
// Il ruolo root non offre alcuna azione: i suoi permessi restano fissi a
// ['*'] (riservato per decisione di sicurezza, vedi RolePermissionsModal e
// AccountController.updateRolePermissions lato backend).

import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader, Table, Badge, Shield, useToast, type TableColumn, type Action } from '@edg/ui';

import { listRoles } from '../api/roleActions';
import RolePermissionsModal from '../components/RolePermissionsModal';
import { roleLabel } from '../constants/roleLabels';
import { rolePermissionStrings, type Role } from '../types';

const RuoliPage: React.FC = () => {
  const toast = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toEdit, setToEdit] = useState<Role | null>(null);

  const loadRoles = useCallback(() => {
    setIsLoading(true);
    listRoles()
      .then(res => setRoles(res.data ?? []))
      .catch(err => toast?.danger({ title: 'Impossibile caricare i ruoli', description: (err as Error).message }))
      .finally(() => setIsLoading(false));
  }, [toast]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const columns: TableColumn<Role>[] = [
    {
      header: 'Ruolo',
      accessor: item => (
        <div className='flex items-center gap-2'>
          <span className='font-medium text-text-primary'>{roleLabel(item.name)}</span>
          {item.name === 'root' && (
            <Badge variant='info' size='sm'>
              Non modificabile
            </Badge>
          )}
        </div>
      ),
    },
    { header: 'Descrizione', accessor: item => item.description ?? '—' },
    {
      header: 'Permessi',
      accessor: item =>
        item.name === 'root' ? (
          <span className='text-text-secondary italic'>Accesso completo (*)</span>
        ) : (
          <span className='text-sm text-text-secondary' title={rolePermissionStrings(item).join(', ')}>
            {rolePermissionStrings(item).length > 0 ? rolePermissionStrings(item).join(', ') : 'Nessun permesso'}
          </span>
        ),
    },
  ];

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Ruoli'
        subtitle='Permessi assegnati a ciascun ruolo — root escluso, non modificabile'
        onRefresh={loadRoles}
        isLoading={isLoading}
      />

      <Table
        data={roles}
        columns={columns}
        keyExtractor={item => item.id}
        isLoading={isLoading}
        emptyMessage='Nessun ruolo presente'
        striped
        hoverable
        rowActions={{
          enabled: true,
          actions: item => {
            if (item.name === 'root') return [];
            const list: Action[] = [
              {
                id: 'edit-permissions',
                label: 'Modifica permessi',
                icon: <Shield className='w-4 h-4' />,
                onClick: () => setToEdit(item),
              },
            ];
            return list;
          },
        }}
      />

      <RolePermissionsModal isOpen={!!toEdit} onClose={() => setToEdit(null)} onSaved={loadRoles} role={toEdit} />
    </div>
  );
};

export default RuoliPage;
