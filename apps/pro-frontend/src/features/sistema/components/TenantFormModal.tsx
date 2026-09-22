// src/features/sistema/components/TenantFormModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, Select, Switch, Shield } from '@edg/ui';

import { TENANT_LOCALE_OPTIONS } from '../types';
import type { Tenant, TenantInput } from '../types';

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: TenantInput) => Promise<void>;
  isSaving: boolean;
  item: Tenant | null; // null = creazione
}

const EMPTY_FORM: TenantInput = { name: '', slug: '', defaultLocale: 'it', isActive: true };

/** kebab-case: stessa regola applicata da Joi lato backend (tenantSchemas). */
const SLUG_PATTERN = '^[a-z0-9]+(-[a-z0-9]+)*$';

const TenantFormModal: React.FC<TenantFormModalProps> = ({ isOpen, onClose, onSave, isSaving, item }) => {
  const [form, setForm] = useState<TenantInput>(EMPTY_FORM);
  const isSystemTenant = item?.isSystem ?? false;

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      item
        ? { name: item.name, slug: item.slug, defaultLocale: item.defaultLocale, isActive: item.isActive }
        : EMPTY_FORM
    );
  }, [isOpen, item]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Modifica tenant' : 'Nuovo tenant'}
      size='md'
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
        {isSystemTenant && (
          <div className='flex items-center gap-2 rounded-md bg-bg-secondary px-3 py-2 text-sm text-text-secondary'>
            <Shield className='h-4 w-4 shrink-0' />
            <span>
              Tenant di sistema (Express Delivery Group): non può essere eliminato né disattivato. Nome e slug restano modificabili.
            </span>
          </div>
        )}

        <Input
          label='Nome'
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          maxLength={128}
          required
        />
        <Input
          label='Slug'
          value={form.slug}
          onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
          pattern={SLUG_PATTERN}
          helperText='Solo lettere minuscole, numeri e trattini (es. mio-tenant)'
          maxLength={64}
          required
        />
        <Select
          label='Lingua di default'
          options={[...TENANT_LOCALE_OPTIONS]}
          value={form.defaultLocale ?? 'it'}
          onValueChange={v => setForm(f => ({ ...f, defaultLocale: v }))}
        />
        <Switch
          label='Attivo'
          checked={form.isActive ?? true}
          onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
          disabled={isSystemTenant}
        />
      </div>
    </Modal>
  );
};

export default TenantFormModal;
