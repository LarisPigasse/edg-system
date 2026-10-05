// src/features/sistema/components/RolePermissionsModal.tsx
//
// Editor dei permessi di un ruolo esistente (ADR024 — "Ruoli/Permessi").
// Per esplicita scelta di scope non è un editor di ruoli: non crea, rinomina
// né elimina ruoli, solo la lista di permessi del ruolo passato in `role`.
//
// Il permesso jolly '*' non è mai proponibile qui: RuoliPage non offre
// nemmeno l'azione "Modifica permessi" sulla riga di root, e in ogni caso
// questo componente non include '*' nel catalogo (vedi permissionCatalog.ts).
// Il backend applica la stessa regola lato server (AccountController.
// updateRolePermissions rifiuta sia il ruolo root sia un tentativo di
// assegnare '*' a chiunque altro) — difesa in profondità, non solo UI.
//
// Permessi fuori catalogo (stringhe presenti sul ruolo ma non descritte in
// permissionCatalog.ts): mostrati in fondo come "Altri permessi del ruolo",
// salvati così come sono finché non vengono tolti. Nulla resta invisibile
// quando il catalogo resta indietro rispetto ai servizi.

import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Checkbox, Badge, useToast, X } from '@edg/ui';

import { updateRolePermissions } from '../api/roleActions';
import { PERMISSION_CATALOG, isCatalogPermission } from '../constants/permissionCatalog';
import { rolePermissionStrings, type Role } from '../types';

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Chiamato dopo un salvataggio riuscito, per ricaricare la lista del chiamante. */
  onSaved: () => void;
  role: Role | null;
}

const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({ isOpen, onClose, onSaved, role }) => {
  const toast = useToast();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset ad ogni apertura (non alla chiusura, per evitare un flash dei
  // valori di default mentre il modal si sta ancora chiudendo) — stesso
  // schema di BlockUserModal.
  useEffect(() => {
    if (isOpen && role) {
      setSelected(new Set(rolePermissionStrings(role)));
    }
  }, [isOpen, role]);

  // Permessi del ruolo che il catalogo non descrive, in ordine alfabetico
  const otherPermissions = useMemo(
    () => Array.from(selected).filter(p => !isCatalogPermission(p)).sort(),
    [selected]
  );

  const removePermission = (permission: string): void => {
    setSelected(prev => {
      const next = new Set(prev);
      next.delete(permission);
      return next;
    });
  };

  const isWildcard = (module: string): boolean => selected.has(`${module}.*`);

  const isActionChecked = (module: string, action: string): boolean =>
    isWildcard(module) || selected.has(`${module}.${action}`);

  const toggleWildcard = (module: string, checked: boolean): void => {
    setSelected(prev => {
      const next = new Set(prev);
      const moduleDef = PERMISSION_CATALOG.find(m => m.module === module);
      moduleDef?.actions.forEach(a => next.delete(`${module}.${a.value}`));
      if (checked) next.add(`${module}.*`);
      else next.delete(`${module}.*`);
      return next;
    });
  };

  const toggleAction = (module: string, action: string, checked: boolean): void => {
    setSelected(prev => {
      const next = new Set(prev);
      const key = `${module}.${action}`;
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const handleSave = async () => {
    if (!role) return;
    setIsSubmitting(true);
    try {
      const res = await updateRolePermissions(role.id, Array.from(selected));
      toast?.({ title: res.message ?? 'Permessi ruolo aggiornati' });
      onSaved();
      onClose();
    } catch (err) {
      toast?.danger({ title: 'Errore nel salvataggio permessi', description: (err as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Permessi ruolo "${role?.name ?? ''}"`}
      size='xxl'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
            Annulla
          </Button>
          <Button variant='primary' onClick={handleSave} isLoading={isSubmitting} loadingText='Salvataggio...'>
            Salva permessi
          </Button>
        </div>
      }
    >
      <div className='space-y-5'>
        <p className='text-sm text-text-secondary'>
          Seleziona i permessi del ruolo <strong className='text-text-primary'>{role?.name}</strong>. &quot;Tutte le
          azioni&quot; assegna il permesso jolly di modulo (<code>modulo.*</code>) e prevale sulle singole azioni.
        </p>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {PERMISSION_CATALOG.map(moduleDef => (
            <div key={moduleDef.module} className='rounded-lg border border-border-default p-4 space-y-3'>
              <div className='flex items-center justify-between gap-2'>
                <h4 className='font-medium text-text-primary'>{moduleDef.label}</h4>
                {!moduleDef.active && (
                  <Badge variant='default' size='sm'>
                    Non ancora attivo
                  </Badge>
                )}
              </div>

              {moduleDef.note && <p className='text-xs text-text-secondary'>{moduleDef.note}</p>}

              {moduleDef.allowWildcard !== false && (
                <Checkbox
                  label='Tutte le azioni'
                  description={`Equivale a "${moduleDef.module}.*"`}
                  checked={isWildcard(moduleDef.module)}
                  onCheckedChange={checked => toggleWildcard(moduleDef.module, checked === true)}
                  size='sm'
                />
              )}

              <div className='grid grid-cols-2 gap-2 pl-1'>
                {moduleDef.actions.map(action => (
                  <Checkbox
                    key={action.value}
                    label={action.label}
                    description={action.description}
                    checked={isActionChecked(moduleDef.module, action.value)}
                    disabled={isWildcard(moduleDef.module)}
                    onCheckedChange={checked => toggleAction(moduleDef.module, action.value, checked === true)}
                    size='sm'
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {otherPermissions.length > 0 && (
          <div className='rounded-lg border border-dashed border-border-default p-4 space-y-3'>
            <div>
              <h4 className='font-medium text-text-primary'>Altri permessi del ruolo</h4>
              <p className='text-xs text-text-secondary'>
                Presenti sul ruolo ma non descritti in questo pannello. Restano salvati così come sono finché non li
                togli.
              </p>
            </div>
            <ul className='flex flex-wrap gap-2'>
              {otherPermissions.map(permission => (
                <li key={permission}>
                  <Badge variant='default' size='sm' className='gap-1 pr-1'>
                    <code>{permission}</code>
                    <button
                      type='button'
                      onClick={() => removePermission(permission)}
                      className='rounded p-0.5 text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                      aria-label={`Togli il permesso ${permission}`}
                      title='Togli dal ruolo'
                    >
                      <X className='w-3 h-3' />
                    </button>
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RolePermissionsModal;
