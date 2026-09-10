// src/features/base/components/OperatoreFormModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, Select, Switch, type SelectOption } from '@edg/ui';

import { listResource } from '../api/systemApi';
import type { Operatore, OperatoreInput, Reparto } from '../types';

interface OperatoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: OperatoreInput) => Promise<void>;
  isSaving: boolean;
  item: Operatore | null; // null = creazione
}

const EMPTY_FORM: OperatoreInput = { nome: '', cognome: '', idReparto: 0, telefono: '', email: '', isActive: true };

const OperatoreFormModal: React.FC<OperatoreFormModalProps> = ({ isOpen, onClose, onSave, isSaving, item }) => {
  const [form, setForm] = useState<OperatoreInput>(EMPTY_FORM);
  const [repartoOptions, setRepartoOptions] = useState<SelectOption[]>([]);

  // Elenco reparti: caricato una volta all'apertura del modal (@edg/ui Select
  // non supporta opzioni async native, quindi la lista arriva già pronta).
  useEffect(() => {
    if (!isOpen) return;
    listResource<Reparto>('reparti', { active: true, limit: 100 })
      .then(res => setRepartoOptions((res.data ?? []).map(r => ({ value: String(r.idReparto), label: r.reparto }))))
      .catch(() => setRepartoOptions([]));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      item
        ? {
            nome: item.nome,
            cognome: item.cognome,
            idReparto: item.idReparto,
            telefono: item.telefono ?? '',
            email: item.email ?? '',
            isActive: item.isActive,
          }
        : EMPTY_FORM
    );
  }, [isOpen, item]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Modifica operatore' : 'Nuovo operatore'}
      size='lg'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose} disabled={isSaving}>
            Annulla
          </Button>
          <Button variant='primary' onClick={() => onSave(form)} isLoading={isSaving} loadingText='Salvataggio...'>
            Salva
          </Button>
        </div>
      }
    >
      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <Input
            label='Nome'
            value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            maxLength={64}
            required
          />
          <Input
            label='Cognome'
            value={form.cognome}
            onChange={e => setForm(f => ({ ...f, cognome: e.target.value }))}
            maxLength={64}
            required
          />
        </div>
        <Select
          label='Reparto'
          options={repartoOptions}
          value={form.idReparto ? String(form.idReparto) : undefined}
          onValueChange={v => setForm(f => ({ ...f, idReparto: Number(v) }))}
          placeholder='Seleziona un reparto'
        />
        <div className='grid grid-cols-2 gap-4'>
          <Input
            label='Telefono'
            value={form.telefono ?? ''}
            onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
            maxLength={64}
          />
          <Input
            label='Email'
            type='email'
            value={form.email ?? ''}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            maxLength={64}
          />
        </div>
        <Switch label='Attivo' checked={form.isActive ?? true} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
      </div>
    </Modal>
  );
};

export default OperatoreFormModal;
