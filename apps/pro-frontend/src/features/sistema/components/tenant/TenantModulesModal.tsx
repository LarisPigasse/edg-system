// src/features/sistema/components/tenant/TenantModulesModal.tsx
//
// Moduli di un tenant (ADR048): finestra larga aperta dalla lista Tenant
// (voce "Moduli" del menu della riga), per admin e root (sistema.moduli).
// Tutto il catalogo diviso per prodotto, in una griglia a due colonne: per
// ogni modulo stato, periodo, "in vigore" e azioni. Prova, attivazione e
// sospensione si aprono sopra questa finestra. Il tenant di sistema ha tutti
// i moduli dal codice: nessuna attivazione da gestire.
import React, { useMemo, useState } from 'react';
import { Button, ConfirmModal, Modal, Shield, Skeleton } from '@edg/ui';

import { useTenantModules } from '../../hooks/useTenantModules';
import type { Tenant } from '../../types';
import type { TenantModuleView } from '../../types/modules';
import { productLabel } from '../../utils/moduleFormat';
import ActivationFormModal, { type ActivationFormResult, type ActivationMode } from './ActivationFormModal';
import ModuleActivationRow, { type ModuleIntent } from './ModuleActivationRow';

const SUCCESS: Record<ActivationMode, string> = {
  trial: 'Prova avviata',
  activate: 'Modulo attivato',
  reactivate: 'Modulo riattivato',
  edit: 'Attivazione aggiornata',
};

interface TenantModulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  /** Settore del cliente collegato (ADR059), se c'è */
  settore?: string | null;
}

const TenantModulesModal: React.FC<TenantModulesModalProps> = ({ isOpen, onClose, tenant, settore }) => {
  // Carica solo a finestra aperta: a ogni apertura i dati sono freschi
  const { data, isLoading, isSaving, activate, update } = useTenantModules(isOpen && tenant ? tenant.id : null);

  const [form, setForm] = useState<{ mode: ActivationMode; view: TenantModuleView } | null>(null);
  const [toSuspend, setToSuspend] = useState<TenantModuleView | null>(null);

  const modules = useMemo(() => data?.modules ?? [], [data]);

  /** Per ogni modulo, i nomi delle dipendenze non in vigore per questo tenant */
  const missing = useMemo(() => {
    const byKey = new Map(modules.map(v => [v.module.key, v]));
    return new Map(
      modules.map(v => [
        v.module.key,
        (v.module.dependencies ?? [])
          .filter(dep => !byKey.get(dep)?.inForce)
          .map(dep => byKey.get(dep)?.module.name ?? dep),
      ])
    );
  }, [modules]);

  /** Prodotti in ordine alfabetico, moduli per nome */
  const groups = useMemo(() => {
    const map = new Map<string, TenantModuleView[]>();
    for (const v of modules) map.set(v.module.product, [...(map.get(v.module.product) ?? []), v]);
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([product, views]) => ({ product, views: [...views].sort((a, b) => a.module.name.localeCompare(b.module.name)) }));
  }, [modules]);

  const inForceCount = modules.filter(v => v.inForce).length;

  const onIntent = (intent: ModuleIntent, view: TenantModuleView) => {
    if (intent === 'suspend') setToSuspend(view);
    else setForm({ mode: intent, view });
  };

  const submit = async (result: ActivationFormResult) => {
    if (!form) return;
    const { mode, view } = form;
    const key = view.module.key;
    const ok = view.activation
      ? await update(key, result, `${view.module.name}: ${SUCCESS[mode].toLowerCase()}`)
      : await activate({
          module: key,
          status: result.status === 'sospeso' ? 'attivo' : result.status,
          startsAt: result.startsAt,
          endsAt: result.endsAt,
          notes: result.notes,
        });
    if (ok) setForm(null);
  };

  const renderBody = () => {
    if (isLoading && !data) {
      return (
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={i} className='h-32 w-full' />
          ))}
        </div>
      );
    }

    if (data?.tenant.allModules) {
      return (
        <div className='flex items-start gap-2 rounded-lg bg-bg-secondary px-4 py-3 text-sm text-text-secondary'>
          <Shield className='mt-0.5 h-4 w-4 shrink-0' />
          <span>
            Tenant di sistema: ha <strong className='text-text-primary'>tutti i moduli, sempre</strong>, compresi quelli
            ancora in sviluppo. Non servono attivazioni.
          </span>
        </div>
      );
    }

    if (groups.length === 0) return <p className='text-sm text-text-secondary'>Il catalogo dei moduli è vuoto.</p>;

    return (
      <div className='space-y-6'>
        <p className='text-sm text-text-secondary'>
          Un modulo è <strong className='text-text-primary'>in vigore</strong> quando è in prova o attivo, nel periodo
          indicato, e i moduli che richiede sono anch'essi in vigore. Le modifiche valgono per gli utenti del tenant al
          prossimo rinnovo dell'accesso (al massimo 16 minuti).
        </p>
        {groups.map(({ product, views }) => (
          <section key={product} className='space-y-2'>
            <h3 className='text-xs font-semibold uppercase tracking-wider text-text-secondary'>{productLabel(product)}</h3>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              {views.map(v => (
                <ModuleActivationRow
                  key={v.module.key}
                  view={v}
                  missingDependencies={missing.get(v.module.key) ?? []}
                  onIntent={onIntent}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  const subtitle = data && !data.tenant.allModules ? `${inForceCount} di ${modules.length} moduli in vigore` : undefined;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Moduli — ${tenant?.name ?? ''}`}
        description={[settore ? `Settore: ${settore}` : null, subtitle].filter(Boolean).join(' · ') || undefined}
        size='xxxl'
        footer={
          <div className='flex justify-end'>
            <Button variant='outline' onClick={onClose}>
              Chiudi
            </Button>
          </div>
        }
      >
        {/* Il corpo della Modal scorre da sé: intestazione e pulsante Chiudi restano fermi */}
        {renderBody()}
      </Modal>

      <ActivationFormModal
        isOpen={!!form}
        onClose={() => setForm(null)}
        onSubmit={submit}
        isSaving={isSaving}
        mode={form?.mode ?? 'trial'}
        view={form?.view ?? null}
      />

      <ConfirmModal
        isOpen={!!toSuspend}
        onClose={() => setToSuspend(null)}
        onConfirm={async () => {
          if (toSuspend) {
            await update(toSuspend.module.key, { status: 'sospeso' }, `${toSuspend.module.name}: sospeso`);
          }
          setToSuspend(null);
        }}
        title='Sospendi modulo'
        message={`Sospendere "${toSuspend?.module.name}" per questo tenant? Gli utenti perdono l'accesso al modulo (al più tardi entro 16 minuti); i dati restano e con Riattiva tornano disponibili.`}
        variant='danger'
        confirmText='Sospendi'
      />
    </>
  );
};

export default TenantModulesModal;
