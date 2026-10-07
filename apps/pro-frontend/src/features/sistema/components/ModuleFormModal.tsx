// src/features/sistema/components/ModuleFormModal.tsx
//
// Creazione e modifica di un modulo del catalogo (solo root, ADR048).
// La chiave si sceglie solo alla creazione: è usata ovunque (JWT, gateway,
// attivazioni) e non cambia più. Le regole vere (chiave unica, dipendenze
// esistenti, niente cicli) le applica auth-service; qui si guida l'utente
// con gli stessi formati e si evitano invii sicuramente sbagliati.
// L'aspetto (icona, logo, titolo) ha una finestra sua: ModuleBrandingModal.
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Input, Select, MultiSelect, Shield, Switch } from '@edg/ui';

import type { CatalogModule, CatalogModuleInput } from '../types/modules';
import {
  DEFAULT_TRIAL_DAYS,
  MODULE_KEY_PATTERN,
  MODULE_KEY_REGEX,
  MODULE_STATUS,
  MODULE_STATUS_OPTIONS,
  productLabel,
} from '../utils/moduleFormat';

interface ModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: CatalogModuleInput) => Promise<void>;
  isSaving: boolean;
  /** null = creazione */
  item: CatalogModule | null;
  /** Catalogo attuale: dipendenze proponibili e prodotti già usati */
  catalog: CatalogModule[];
}

const EMPTY_FORM: CatalogModuleInput = {
  key: '',
  name: '',
  description: null,
  product: '',
  dependencies: [],
  status: 'sviluppo',
  showcase: false,
  trialDays: DEFAULT_TRIAL_DAYS,
  version: '1.0.0',
};

const VERSION_REGEX = /^\d{1,4}\.\d{1,4}\.\d{1,4}$/;

type Errors = Partial<Record<'key' | 'name' | 'product' | 'trialDays' | 'version', string>>;

function validate(form: CatalogModuleInput, isNew: boolean): Errors {
  const e: Errors = {};
  if (isNew && !MODULE_KEY_REGEX.test(form.key ?? ''))
    e.key = 'Minuscole, cifre e trattini; inizia con una lettera (es. vigilo)';
  if (!form.name.trim()) e.name = 'Il nome è obbligatorio';
  if (!MODULE_KEY_REGEX.test(form.product)) e.product = 'Minuscole, cifre e trattini (es. spedizioni)';
  if (!Number.isInteger(form.trialDays) || form.trialDays < 1 || form.trialDays > 256)
    e.trialDays = 'Da 1 a 256 giorni';
  if (!VERSION_REGEX.test(form.version)) e.version = 'Nel formato major.minor.patch (es. 1.2.0)';
  return e;
}

const ModuleFormModal: React.FC<ModuleFormModalProps> = ({ isOpen, onClose, onSave, isSaving, item, catalog }) => {
  const [form, setForm] = useState<CatalogModuleInput>(EMPTY_FORM);
  const [touched, setTouched] = useState(false);
  const isNew = item === null;

  useEffect(() => {
    if (!isOpen) return;
    setTouched(false);
    setForm(
      item
        ? {
            key: item.key,
            name: item.name,
            description: item.description,
            product: item.product,
            dependencies: item.dependencies ?? [],
            status: item.status,
            showcase: item.showcase,
            trialDays: item.trialDays,
            version: item.version,
          }
        : EMPTY_FORM
    );
  }, [isOpen, item]);

  const errors = useMemo(() => validate(form, isNew), [form, isNew]);
  const show = (field: keyof Errors) => (touched ? errors[field] : undefined);

  // Dipendenze: tutti gli altri moduli del catalogo (i cicli li rifiuta il backend)
  const dependencyOptions = useMemo(
    () => catalog.filter(m => m.key !== item?.key).map(m => ({ value: m.key, label: `${m.name} (${m.key})` })),
    [catalog, item]
  );

  // Prodotti già usati, suggeriti nel campo Prodotto
  const products = useMemo(() => Array.from(new Set(catalog.map(m => m.product))).sort(), [catalog]);

  const handleSave = () => {
    setTouched(true);
    if (Object.keys(errors).length > 0) return;
    void onSave({
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? 'Nuovo modulo' : `Modifica modulo "${item?.name}"`}
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
        <div className='flex items-start gap-2 rounded-md bg-bg-secondary px-3 py-2 text-sm text-text-secondary'>
          <Shield className='mt-0.5 h-4 w-4 shrink-0' />
          <span>
            Il modulo nasce nel codice (menu, rotte, permessi): il catalogo lo descrive e lo rende attivabile per i
            tenant.
          </span>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Input
            label='Nome'
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            maxLength={64}
            error={show('name')}
            required
          />
          <Input
            label='Chiave'
            value={form.key ?? ''}
            onChange={e => setForm(f => ({ ...f, key: e.target.value.toLowerCase() }))}
            pattern={MODULE_KEY_PATTERN}
            maxLength={32}
            disabled={!isNew}
            error={show('key')}
            helperText={isNew ? 'Stabile: dopo la creazione non si cambia più' : 'Non modificabile'}
            required
          />
          <Input
            label='Prodotto'
            value={form.product}
            onChange={e =>
              setForm(f => ({
                ...f,
                product: e.target.value.toLowerCase(),
              }))
            }
            list='module-products'
            maxLength={32}
            error={show('product')}
            helperText={
              products.length > 0
                ? `Già usati: ${products.map(productLabel).join(', ')}`
                : 'Raggruppa i moduli nel menu'
            }
            required
          />
          <datalist id='module-products'>
            {products.map(p => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <Input
            label='Versione'
            value={form.version}
            onChange={e => setForm(f => ({ ...f, version: e.target.value.trim() }))}
            maxLength={16}
            error={show('version')}
            helperText='major.minor.patch: da aggiornare a ogni rilascio'
            required
          />
        </div>

        <Input
          label='Sottotitolo'
          value={form.description ?? ''}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          maxLength={128}
          helperText='Sotto il logo, nel riquadro della home'
        />

        <MultiSelect
          label='Dipendenze'
          options={dependencyOptions}
          value={form.dependencies}
          onChange={dependencies => setForm(f => ({ ...f, dependencies }))}
          placeholder='Nessuna'
          helperText='Moduli che devono essere in vigore perché questo funzioni'
        />

        <div className='grid grid-cols-1 items-start gap-4 sm:grid-cols-2'>
          <Select
            label='Stato'
            options={MODULE_STATUS_OPTIONS}
            value={form.status}
            onValueChange={v => setForm(f => ({ ...f, status: v as CatalogModuleInput['status'] }))}
            helperText={MODULE_STATUS[form.status].hint}
          />
          <Input
            label='Giorni di prova'
            type='number'
            min={1}
            max={256}
            value={String(form.trialDays)}
            onChange={e => setForm(f => ({ ...f, trialDays: Number(e.target.value) }))}
            error={show('trialDays')}
            helperText='Durata proposta quando si avvia una prova'
            required
          />
        </div>

        <Switch
          label='In vetrina'
          checked={form.showcase}
          onCheckedChange={showcase => setForm(f => ({ ...f, showcase }))}
          description={
            form.status !== 'disponibile'
              ? 'Conta solo quando il modulo è disponibile'
              : form.showcase
                ? 'Chi non lo ha lo vede spento, per scoprirlo e chiederlo'
                : 'Riservato: lo vede solo chi lo ha'
          }
        />
      </div>
    </Modal>
  );
};

export default ModuleFormModal;
