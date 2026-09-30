// src/features/sistema/components/info/rules/RecipientFormModal.tsx
//
// Creazione/modifica di un destinatario degli allarmi (ADR038).
import React, { useEffect, useState } from 'react';
import { Button, Input, Modal, Switch } from '@edg/ui';

import type { AlertRecipient, AlertRecipientInput } from '../../../types/info';

const EMPTY_FORM: AlertRecipientInput = { name: '', email: '', enabled: true, isDefault: true };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RecipientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: AlertRecipientInput) => Promise<void>;
  isSaving: boolean;
  item: AlertRecipient | null; // null = creazione
}

const RecipientFormModal: React.FC<RecipientFormModalProps> = ({ isOpen, onClose, onSave, isSaving, item }) => {
  const [form, setForm] = useState<AlertRecipientInput>(EMPTY_FORM);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(item ? { name: item.name, email: item.email, enabled: item.enabled, isDefault: item.isDefault } : EMPTY_FORM);
    setTouched(false);
  }, [isOpen, item]);

  const nameError = touched && form.name.trim() === '' ? 'Il nome è obbligatorio' : undefined;
  const emailError = touched && !EMAIL_RE.test(form.email.trim()) ? 'Indirizzo email non valido' : undefined;

  const handleSave = () => {
    setTouched(true);
    if (form.name.trim() === '' || !EMAIL_RE.test(form.email.trim())) return;
    void onSave({ ...form, name: form.name.trim(), email: form.email.trim().toLowerCase() });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Modifica destinatario' : 'Nuovo destinatario'}
      size='md'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose} disabled={isSaving}>
            Annulla
          </Button>
          <Button variant='primary' onClick={handleSave} isLoading={isSaving} loadingText='Salvataggio...'>
            Salva
          </Button>
        </div>
      }
    >
      <div className='flex flex-col gap-4'>
        <Input
          label='Nome'
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          maxLength={128}
          error={nameError}
          required
        />
        <Input
          label='Email'
          type='email'
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          error={emailError}
          required
        />
        <Switch
          label='Destinatario predefinito'
          description='Riceve gli allarmi delle regole che non indicano destinatari specifici'
          checked={form.isDefault}
          onCheckedChange={checked => setForm(f => ({ ...f, isDefault: checked }))}
        />
        <Switch
          label='Attivo'
          description='Un destinatario disattivato non riceve nessun allarme'
          checked={form.enabled}
          onCheckedChange={checked => setForm(f => ({ ...f, enabled: checked }))}
        />
      </div>
    </Modal>
  );
};

export default RecipientFormModal;
