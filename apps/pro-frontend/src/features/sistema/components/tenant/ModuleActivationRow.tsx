// src/features/sistema/components/tenant/ModuleActivationRow.tsx
//
// Un modulo del catalogo visto da un tenant, come riquadro della griglia a due
// colonne di TenantModulesModal: stato dell'attivazione, periodo, se è in
// vigore adesso e, in fondo, le azioni possibili in quello stato. Le azioni
// arrivano al genitore come intenzioni ('trial', 'suspend', ...): qui non si
// chiama nessuna API.
import React from 'react';
import { Badge, Button } from '@edg/ui';

import type { TenantModuleView } from '../../types/modules';
import { ACTIVATION_STATUS, MODULE_STATUS } from '../../utils/moduleFormat';
import { formatDate, relativeDays } from '../../utils/activationDates';

export type ModuleIntent = 'trial' | 'activate' | 'reactivate' | 'edit' | 'suspend';

interface ModuleActivationRowProps {
  view: TenantModuleView;
  /** Nomi delle dipendenze non in vigore per questo tenant ([] = tutte presenti) */
  missingDependencies: string[];
  onIntent: (intent: ModuleIntent, view: TenantModuleView) => void;
}

/** Riga di stato: periodo e conseguenze, in parole */
function describe(view: TenantModuleView): string {
  const a = view.activation;
  if (!a) return 'Non attivo';
  switch (a.status) {
    case 'prova':
      return a.endsAt ? `In prova fino al ${formatDate(a.endsAt)} (${relativeDays(a.endsAt)})` : 'In prova';
    case 'attivo':
      return a.endsAt ? `Attivo fino al ${formatDate(a.endsAt)} (${relativeDays(a.endsAt)})` : 'Attivo, senza scadenza';
    case 'sospeso':
      return `Sospeso dal ${formatDate(a.updatedAt)}: dati conservati`;
    case 'scaduto':
      return [
        `Scaduto il ${formatDate(a.expiredAt ?? a.endsAt ?? a.updatedAt)}`,
        view.purgeAt ? `dati conservati fino al ${formatDate(view.purgeAt)}` : null,
      ]
        .filter(Boolean)
        .join('; ');
  }
}

/** Perché un modulo con stato "valido" non è in vigore (inizio futuro o dipendenze) */
function notInForceReason(view: TenantModuleView, missing: string[]): string | null {
  const a = view.activation;
  if (view.inForce || !a || (a.status !== 'prova' && a.status !== 'attivo')) return null;
  if (new Date(a.startsAt) > new Date()) return `Non ancora in vigore: inizia il ${formatDate(a.startsAt)}`;
  if (missing.length > 0) return `Non in vigore: richiede ${missing.join(', ')}`;
  if (view.module.status === 'dismesso') return 'Non in vigore: modulo dismesso';
  return 'Non in vigore';
}

const ModuleActivationRow: React.FC<ModuleActivationRowProps> = ({ view, missingDependencies, onIntent }) => {
  const { module, activation } = view;
  const dismissed = module.status === 'dismesso';
  const blockedBy = dismissed
    ? 'Modulo dismesso'
    : missingDependencies.length > 0
      ? `Richiede ${missingDependencies.join(', ')}`
      : null;
  const reason = notInForceReason(view, missingDependencies);

  const act = (intent: ModuleIntent) => () => onIntent(intent, view);

  return (
    <div className='flex h-full flex-col justify-between gap-3 rounded-lg border border-border-default px-4 py-3'>
      <div className='min-w-0 space-y-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='font-medium text-text-primary'>{module.name}</span>
          <code className='text-xs text-text-secondary'>{module.key}</code>
          {activation && (
            <Badge size='xs' variant={ACTIVATION_STATUS[activation.status].variant}>
              {ACTIVATION_STATUS[activation.status].label}
            </Badge>
          )}
          {module.status !== 'disponibile' && (
            <Badge size='xs' variant={MODULE_STATUS[module.status].variant}>
              {MODULE_STATUS[module.status].label}
            </Badge>
          )}
          {view.inForce && (
            <span className='inline-flex items-center gap-1 text-xs text-text-success'>
              <span className='h-2 w-2 rounded-full bg-action-success' /> In vigore
            </span>
          )}
        </div>
        <p className='text-sm text-text-secondary'>{describe(view)}</p>
        {reason && <p className='text-xs text-text-warning'>{reason}</p>}
        {!activation && blockedBy && <p className='text-xs text-text-warning'>{blockedBy}</p>}
        {activation?.notes && <p className='text-xs italic text-text-secondary'>{activation.notes}</p>}
      </div>

      <div className='flex flex-wrap gap-2 border-t border-border-default pt-3'>
        {!activation && (
          <>
            <Button size='sm' variant='outline' onClick={act('trial')} disabled={!!blockedBy}>
              Avvia prova
            </Button>
            <Button size='sm' variant='primary' onClick={act('activate')} disabled={!!blockedBy}>
              Attiva
            </Button>
          </>
        )}
        {activation?.status === 'prova' && (
          <Button size='sm' variant='primary' onClick={act('activate')} disabled={!!blockedBy}>
            Attiva
          </Button>
        )}
        {(activation?.status === 'sospeso' || activation?.status === 'scaduto') && (
          <Button size='sm' variant='primary' onClick={act('reactivate')} disabled={!!blockedBy}>
            Riattiva
          </Button>
        )}
        {activation && activation.status !== 'scaduto' && (
          <Button size='sm' variant='outline' onClick={act('edit')}>
            {activation.status === 'sospeso' ? 'Modifica' : 'Proroga / modifica'}
          </Button>
        )}
        {(activation?.status === 'prova' || activation?.status === 'attivo') && (
          <Button size='sm' variant='danger' onClick={act('suspend')}>
            Sospendi
          </Button>
        )}
      </div>
    </div>
  );
};

export default ModuleActivationRow;
