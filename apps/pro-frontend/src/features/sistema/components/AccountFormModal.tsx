// src/features/sistema/components/AccountFormModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, Select, Switch, RefreshCw, Copy, Check, type SelectOption } from '@edg/ui';

import { authApi } from '../api/authApi';
import { generateSecurePassword } from '../../../shared/utils/generatePassword';
import { ACCOUNT_TYPE_OPTIONS, ROLE_ACCOUNT_TYPE_RESTRICTIONS, ROLES_REQUIRING_SYSTEM_TENANT } from '../types';
import type { Account, AccountInput, AccountRole, Tenant } from '../types';
import EntityLinkSelect from './EntityLinkSelect';

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: AccountInput) => Promise<void>;
  isSaving: boolean;
  item: Account | null; // null = creazione
  /** Elenco completo degli account esistenti: serve solo per calcolare quali
   * entità sono già collegate altrove, ed escluderle dal selettore (vedi
   * takenEntityIds sotto). */
  accounts: Account[];
}

const emptyForm = (): AccountInput => ({
  email: '',
  password: generateSecurePassword(),
  roleId: 0,
  tenantId: 0,
  accountType: 'operatore',
  entityId: null,
});

const AccountFormModal: React.FC<AccountFormModalProps> = ({ isOpen, onClose, onSave, isSaving, item, accounts }) => {
  const [form, setForm] = useState<AccountInput>(emptyForm);
  // Elenco completo (non solo {value,label}): serve anche isSystem, per
  // riconoscere il tenant di sistema quando il ruolo scelto lo richiede.
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [roleOptions, setRoleOptions] = useState<SelectOption[]>([]);
  const [resetPassword, setResetPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tenant e ruoli per i selettori: caricati una volta all'apertura del modal
  // (@edg/ui Select non supporta opzioni async native).
  useEffect(() => {
    if (!isOpen) return;
    authApi
      .listResource<Tenant>('tenants', { active: true, limit: 100 })
      .then(res => setTenants(res.data ?? []))
      .catch(() => setTenants([]));
    authApi
      .listResource<AccountRole>('accounts/roles')
      .then(res => setRoleOptions((res.data ?? []).map(r => ({ value: String(r.id), label: r.name }))))
      .catch(() => setRoleOptions([]));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setResetPassword(false);
    setCopied(false);
    setForm(
      item
        ? {
            email: item.email,
            roleId: item.roleId,
            tenantId: item.tenantId ?? 0,
            accountType: item.accountType,
            entityId: item.entityId ?? null,
            password: undefined,
          }
        : emptyForm()
    );
  }, [isOpen, item]);

  const tenantOptions = tenants.map(t => ({ value: String(t.id), label: t.name }));
  const systemTenant = tenants.find(t => t.isSystem);
  const currentRoleName = roleOptions.find(o => o.value === String(form.roleId))?.label;
  const currentRoleRequiresSystemTenant = !!currentRoleName && ROLES_REQUIRING_SYSTEM_TENANT.includes(currentRoleName);

  // Ruoli non selezionabili per l'accountType corrente (es. root su un account
  // cliente): stessa regola applicata lato backend — qui solo per non far
  // scegliere all'utente una combinazione che verrebbe comunque respinta.
  const forbiddenRoleNames = Object.entries(ROLE_ACCOUNT_TYPE_RESTRICTIONS)
    .filter(([, types]) => types.includes(form.accountType))
    .map(([roleName]) => roleName);
  const availableRoleOptions = roleOptions.filter(opt => !forbiddenRoleNames.includes(opt.label));

  // Tenant proposti nel Select: se il ruolo corrente richiede il tenant di
  // sistema (es. root), l'unica scelta sensata è quella — niente da
  // selezionare per sbaglio.
  const availableTenantOptions =
    currentRoleRequiresSystemTenant && systemTenant ? [{ value: String(systemTenant.id), label: systemTenant.name }] : tenantOptions;

  // Entità (operatore/anagrafica) già collegate ad ALTRI account: un'entità
  // ha un solo account, quindi EntityLinkSelect non deve riproporle. Si
  // esclude l'account in modifica stesso, altrimenti la sua stessa entità
  // collegata sparirebbe dalle opzioni.
  const takenEntityIds = new Set(
    accounts.filter(a => a.entityId && a.id !== item?.id).map(a => a.entityId as string)
  );

  const handleAccountTypeChange = (accountType: string) => {
    setForm(f => {
      // entityId punta a una risorsa diversa per ogni accountType (operatori
      // vs anagrafiche): al cambio tipo non ha più senso, va riselezionato.
      const next = { ...f, accountType, entityId: null };
      const currentRole = roleOptions.find(o => o.value === String(f.roleId));
      const restrictedTypes = currentRole ? ROLE_ACCOUNT_TYPE_RESTRICTIONS[currentRole.label] : undefined;
      if (currentRole && restrictedTypes?.includes(accountType)) {
        next.roleId = 0; // il ruolo attuale non è più ammesso: da riselezionare
      }
      return next;
    });
  };

  const handleRoleChange = (value: string) => {
    setForm(f => {
      const next = { ...f, roleId: Number(value) };
      const nextRole = roleOptions.find(o => o.value === value);
      // Ruolo che richiede il tenant di sistema (es. root): non lasciare
      // impostato un tenant diverso, non ha senso proporne la scelta.
      if (nextRole && ROLES_REQUIRING_SYSTEM_TENANT.includes(nextRole.label) && systemTenant) {
        next.tenantId = systemTenant.id;
      }
      return next;
    });
  };

  const handleTenantChange = (value: string) => {
    setForm(f => {
      const next = { ...f, tenantId: Number(value) };
      // Se il ruolo attuale richiede il tenant di sistema e si sceglie un
      // tenant diverso, il ruolo non è più ammesso: da riselezionare.
      if (currentRoleRequiresSystemTenant && (!systemTenant || String(systemTenant.id) !== value)) {
        next.roleId = 0;
      }
      return next;
    });
  };

  const regeneratePassword = () => setForm(f => ({ ...f, password: generateSecurePassword() }));

  const handleCopyPassword = async () => {
    if (!form.password) return;
    try {
      await navigator.clipboard.writeText(form.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard non disponibile (contesto non sicuro, permessi negati, ...):
      // l'utente può comunque selezionare e copiare il testo a mano.
    }
  };

  const handleSave = () => {
    const { password, ...rest } = form;
    const includePassword = !item || resetPassword;
    onSave(includePassword ? { ...rest, password } : rest);
  };

  const showPasswordField = !item || resetPassword;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Modifica account' : 'Nuovo account'}
      size='lg'
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
      <div className='space-y-4'>
        <Input
          label='Email'
          type='email'
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          maxLength={256}
          required
        />

        <div className='grid grid-cols-2 gap-4'>
          <Select label='Tipo account' options={[...ACCOUNT_TYPE_OPTIONS]} value={form.accountType} onValueChange={handleAccountTypeChange} />
          <Select
            label='Tenant'
            options={availableTenantOptions}
            value={form.tenantId ? String(form.tenantId) : undefined}
            onValueChange={handleTenantChange}
            placeholder='Seleziona un tenant'
          />
        </div>

        <EntityLinkSelect
          accountType={form.accountType}
          value={form.entityId}
          onChange={entityId => setForm(f => ({ ...f, entityId }))}
          excludeEntityIds={takenEntityIds}
        />

        <Select
          label='Ruolo'
          options={availableRoleOptions}
          value={form.roleId ? String(form.roleId) : undefined}
          onValueChange={handleRoleChange}
          placeholder='Seleziona un ruolo'
        />

        {item && <Switch label='Reimposta password' checked={resetPassword} onCheckedChange={setResetPassword} />}

        {showPasswordField && (
          <div className='flex items-end gap-2'>
            <div className='flex-1'>
              <Input
                label={item ? 'Nuova password' : 'Password iniziale'}
                value={form.password ?? ''}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                helperText='Comunicala al titolare: potrà cambiarla in seguito dal proprio profilo.'
              />
            </div>
            <Button
              type='button'
              variant='outline'
              onClick={regeneratePassword}
              title='Genera una nuova password'
              aria-label='Genera una nuova password'
            >
              <RefreshCw className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={handleCopyPassword}
              title='Copia negli appunti'
              aria-label='Copia la password negli appunti'
            >
              {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AccountFormModal;
