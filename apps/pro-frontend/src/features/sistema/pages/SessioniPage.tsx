// src/features/sistema/pages/SessioniPage.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { PageHeader, Table, ConfirmModal, StatTile, useToast, LogOut, Lock, type TableColumn, type Action } from '@edg/ui';

import { authApi } from '../api/authApi';
import BlockUserModal from '../components/BlockUserModal';
import type { Session } from '../types';

const formatDateTime = (value: string | null): string => {
  if (!value) return '—';
  return new Date(value).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
};

const SessioniPage: React.FC = () => {
  const toast = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toRevoke, setToRevoke] = useState<Session | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [toBlockUser, setToBlockUser] = useState<{ id: number; email: string } | null>(null);

  // Non e' una risorsa CRUD (nessun create/update, solo lista + revoca):
  // bypassa useEntityCrud e chiama direttamente l'endpoint, stesso schema di
  // loadStats/handleHardDelete in AccountPage.tsx.
  const loadSessions = useCallback(() => {
    setIsLoading(true);
    authApi
      .listResource<Session>('sessions')
      .then(res => setSessions(res.data ?? []))
      .catch(err => toast?.danger({ title: 'Impossibile caricare le sessioni', description: (err as Error).message }))
      .finally(() => setIsLoading(false));
  }, [toast]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRevoke = async () => {
    if (!toRevoke) return;
    setIsRevoking(true);
    try {
      const res = await authApi.removeResource('sessions', toRevoke.id);
      toast?.({ title: res.message ?? 'Sessione revocata' });
      loadSessions();
    } catch (err) {
      // Include il caso "non puoi revocare la tua sessione corrente" (400 dal
      // backend): il messaggio arriva già pronto per l'utente.
      toast?.danger({ title: 'Errore nella revoca', description: (err as Error).message });
    } finally {
      setIsRevoking(false);
      setToRevoke(null);
    }
  };

  const columns: TableColumn<Session>[] = [
    { header: 'Utente', accessor: item => item.user.email },
    { header: 'Ruolo', accessor: item => item.user.role },
    {
      header: 'Dispositivo',
      accessor: item => (
        <div>
          <div className='text-text-primary'>{item.device.browser ?? '—'}</div>
          <div className='text-xs text-text-secondary'>
            {[item.device.os, item.device.device].filter(Boolean).join(' · ') || '—'}
          </div>
        </div>
      ),
    },
    { header: 'IP', accessor: item => item.device.ip ?? '—' },
    { header: 'Località', accessor: item => [item.geo.city, item.geo.country].filter(Boolean).join(', ') || '—' },
    { header: 'Ultima attività', accessor: item => formatDateTime(item.lastActivityAt) },
    { header: 'Scade il', accessor: item => formatDateTime(item.expiresAt) },
  ];

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Sessioni'
        subtitle='Sessioni attive su tutta la piattaforma'
        onRefresh={loadSessions}
        isLoading={isLoading}
        actions={<StatTile value={sessions.length} label='Attive' />}
      />

      <Table
        data={sessions}
        columns={columns}
        keyExtractor={item => item.id}
        isLoading={isLoading}
        emptyMessage='Nessuna sessione attiva'
        striped
        hoverable
        rowActions={{
          enabled: true,
          actions: item => {
            const list: Action[] = [
              {
                id: 'revoke',
                label: 'Revoca',
                icon: <LogOut className='w-4 h-4' />,
                variant: 'danger',
                onClick: () => setToRevoke(item),
              },
              {
                id: 'block-user',
                label: 'Blocca utente',
                icon: <Lock className='w-4 h-4' />,
                variant: 'danger',
                onClick: () => setToBlockUser({ id: item.user.id, email: item.user.email }),
              },
            ];
            return list;
          },
        }}
      />

      <ConfirmModal
        isOpen={!!toRevoke}
        onClose={() => setToRevoke(null)}
        onConfirm={handleRevoke}
        isLoading={isRevoking}
        title='Revoca sessione'
        message={`Revocare la sessione di "${toRevoke?.user.email}"? L'accesso da quel dispositivo verrà bloccato immediatamente, anche se il token non è ancora scaduto.`}
        variant='danger'
        confirmText='Revoca'
      />

      <BlockUserModal
        isOpen={!!toBlockUser}
        onClose={() => setToBlockUser(null)}
        onBlocked={loadSessions}
        account={toBlockUser}
      />
    </div>
  );
};

export default SessioniPage;
