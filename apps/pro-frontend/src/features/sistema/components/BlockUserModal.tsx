// src/features/sistema/components/BlockUserModal.tsx
//
// Modal condiviso per il blocco di un account: usato sia da AccountPage
// (gestione utenti) sia da SessioniPage (blocco rapido dell'utente da una
// sessione sospetta) — vedi blockUser in api/accountActions.ts.
//
// A differenza della semplice "Disattiva", registra un motivo e una durata
// di riferimento (SessionController.blockUser lato backend), e revoca subito
// tutte le sessioni attive dell'utente.

import React, { useEffect, useState } from 'react';
import { Modal, Button, Select, TextArea, useToast, type SelectOption } from '@edg/ui';

import { blockUser, BLOCK_DURATION_OPTIONS, type BlockDuration } from '../api/accountActions';

interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Chiamato dopo un blocco riuscito, per ricaricare la lista del chiamante. */
  onBlocked: () => void;
  /** Basta id + email: valido sia per Account (AccountPage) sia per Session.user (SessioniPage). */
  account: { id: number; email: string } | null;
}

const DURATION_OPTIONS: SelectOption[] = BLOCK_DURATION_OPTIONS.map(o => ({ value: o.value, label: o.label }));

const BlockUserModal: React.FC<BlockUserModalProps> = ({ isOpen, onClose, onBlocked, account }) => {
  const toast = useToast();
  const [duration, setDuration] = useState<BlockDuration>('24h');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset ad ogni apertura, non alla chiusura: evita un flash dei valori
  // di default mentre il modal si sta ancora chiudendo.
  useEffect(() => {
    if (isOpen) {
      setDuration('24h');
      setReason('');
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!account) return;
    setIsSubmitting(true);
    try {
      const res = await blockUser(account.id, { duration, reason: reason.trim() || undefined });
      toast?.({ title: res.message ?? 'Utente bloccato' });
      onBlocked();
      onClose();
    } catch (err) {
      toast?.danger({ title: 'Errore nel blocco utente', description: (err as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Blocca utente'
      size='sm'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
            Annulla
          </Button>
          <Button variant='danger' onClick={handleConfirm} isLoading={isSubmitting} loadingText='Blocco...'>
            Blocca
          </Button>
        </div>
      }
    >
      <div className='space-y-4'>
        <p className='text-sm text-text-secondary'>
          Blocca l&apos;accesso di <strong className='text-text-primary'>{account?.email}</strong>: l&apos;account viene
          disattivato e tutte le sue sessioni attive vengono revocate immediatamente, anche sui dispositivi già connessi.
        </p>

        <Select
          label='Durata'
          options={DURATION_OPTIONS}
          value={duration}
          onValueChange={v => setDuration(v as BlockDuration)}
          helperText={`Valore di riferimento: allo scadere l'account resta comunque disattivato finché non lo sblocchi da qui.`}
        />

        <TextArea
          label='Motivo'
          value={reason}
          onChange={e => setReason(e.target.value)}
          helperText='Facoltativo — se lasciato vuoto verrà registrato "Bloccato da amministratore".'
          minRows={2}
          maxRows={4}
        />
      </div>
    </Modal>
  );
};

export default BlockUserModal;
