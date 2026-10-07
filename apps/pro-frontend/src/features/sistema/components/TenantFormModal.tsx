// src/features/sistema/components/TenantFormModal.tsx
//
// Creazione e modifica di un tenant. Il campo Cliente (ADR058) collega il
// tenant a un cliente dell'anagrafica EDG: al massimo un tenant per cliente,
// quindi i clienti già collegati ad altri tenant non si propongono. Usato
// anche da Anagrafiche ("Crea tenant"), con i valori iniziali precompilati.
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Input, Select, Switch, Shield, type SelectOption } from '@edg/ui';

import { TENANT_LOCALE_OPTIONS } from '../types';
import type { Tenant, TenantInput } from '../types';
import { useEdgClienti } from '../api/useEdgClienti';

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: TenantInput) => Promise<void>;
  isSaving: boolean;
  item: Tenant | null; // null = creazione
  /** Solo in creazione: valori iniziali (es. dal cliente in Anagrafiche) */
  initial?: Partial<TenantInput>;
  /** UUID dei clienti già collegati ad ALTRI tenant: non si ripropongono */
  takenClienti?: ReadonlySet<string>;
}

// Radix Select non ammette un valore vuoto: sentinella per "nessun cliente"
const NO_CLIENTE = '__none__';

const EMPTY_FORM: TenantInput = {
  name: '',
  slug: '',
  clienteUuid: null,
  defaultLocale: 'it',
  isActive: true,
};

/** kebab-case: stessa regola applicata da Joi lato backend (tenantSchemas). */
const SLUG_PATTERN = '^[a-z0-9]+(-[a-z0-9]+)*$';

const TenantFormModal: React.FC<TenantFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  item,
  initial,
  takenClienti,
}) => {
  const [form, setForm] = useState<TenantInput>(EMPTY_FORM);
  const isSystemTenant = item?.isSystem ?? false;
  const { clienti, isLoading: clientiLoading, settoreOfCliente } = useEdgClienti(isOpen && !isSystemTenant);
  // Il settore sta sul cliente (ADR059): qui si mostra soltanto
  const settore = settoreOfCliente(form.clienteUuid);

  // Clienti proponibili: non collegati ad altri tenant e attivi; quello già
  // scelto resta comunque visibile, anche se nel frattempo disattivato
  const clienteOptions: SelectOption[] = useMemo(
    () => [
      { value: NO_CLIENTE, label: 'Nessun cliente' },
      ...clienti
        .filter(c => c.uuidAnagrafica === form.clienteUuid || (c.isActive && !takenClienti?.has(c.uuidAnagrafica)))
        .map(c => ({
          value: c.uuidAnagrafica,
          label: c.isActive ? c.ragioneSociale : `${c.ragioneSociale} (disattivato)`,
        })),
    ],
    [clienti, form.clienteUuid, takenClienti]
  );

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      item
        ? {
            name: item.name,
            slug: item.slug,
            clienteUuid: item.clienteUuid ?? null,
            defaultLocale: item.defaultLocale,
            isActive: item.isActive,
          }
        : { ...EMPTY_FORM, ...initial }
    );
  }, [isOpen, item, initial]);

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
              Tenant di sistema (Express Delivery Group): non può essere eliminato né disattivato. Nome e slug restano
              modificabili.
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
        {!isSystemTenant && (
          <Select
            label='Cliente'
            options={clienteOptions}
            value={form.clienteUuid ?? NO_CLIENTE}
            onValueChange={v => setForm(f => ({ ...f, clienteUuid: v === NO_CLIENTE ? null : v }))}
            disabled={clientiLoading}
            helperText={
              form.clienteUuid
                ? `Settore del cliente: ${settore ?? 'non indicato'} (si modifica in Anagrafiche)`
                : "Cliente dell'anagrafica EDG a cui corrisponde il tenant. Facoltativo"
            }
          />
        )}
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
