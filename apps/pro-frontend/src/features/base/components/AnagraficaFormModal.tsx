// src/features/base/components/AnagraficaFormModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, Select, Switch, TextArea, type SelectOption } from '@edg/ui';

import type { Anagrafica, AnagraficaInput, TipoAnagrafica } from '../types';
import { TIPO_ANAGRAFICA_LABELS } from '../types';

interface AnagraficaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: AnagraficaInput) => Promise<void>;
  isSaving: boolean;
  item: Anagrafica | null; // null = creazione
  /** Tenant dell'operatore connesso: precompilato, non modificabile dal form. */
  currentTenantId: number;
}

const emptyForm = (tenantId: number): AnagraficaInput => ({
  tipo: 'cliente',
  idTenant: tenantId,
  ragioneSociale: '',
  partitaIva: '',
  codiceFiscale: '',
  indirizzo: '',
  cap: '',
  citta: '',
  provincia: '',
  telefono: '',
  email: '',
  referente: '',
  note: '',
  isActive: true,
});

const TIPO_OPTIONS: SelectOption[] = (Object.entries(TIPO_ANAGRAFICA_LABELS) as [TipoAnagrafica, string][]).map(
  ([value, label]) => ({ value, label })
);

const AnagraficaFormModal: React.FC<AnagraficaFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  item,
  currentTenantId,
}) => {
  const [form, setForm] = useState<AnagraficaInput>(emptyForm(currentTenantId));

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      item
        ? {
            tipo: item.tipo,
            idTenant: item.idTenant,
            ragioneSociale: item.ragioneSociale,
            partitaIva: item.partitaIva ?? '',
            codiceFiscale: item.codiceFiscale ?? '',
            indirizzo: item.indirizzo ?? '',
            cap: item.cap ?? '',
            citta: item.citta ?? '',
            provincia: item.provincia ?? '',
            telefono: item.telefono ?? '',
            email: item.email ?? '',
            referente: item.referente ?? '',
            note: item.note ?? '',
            isActive: item.isActive,
          }
        : emptyForm(currentTenantId)
    );
  }, [isOpen, item, currentTenantId]);

  const set = <K extends keyof AnagraficaInput>(key: K, value: AnagraficaInput[K]) => setForm(f => ({ ...f, [key]: value }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Modifica anagrafica' : 'Nuova anagrafica'}
      size='xxl'
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
      <div className='space-y-2'>
        <div className='grid grid-cols-2 gap-4'>
          <Select label='Tipo' options={TIPO_OPTIONS} value={form.tipo} onValueChange={v => set('tipo', v as TipoAnagrafica)} />
          <Input
            label='Ragione sociale'
            value={form.ragioneSociale}
            onChange={e => set('ragioneSociale', e.target.value)}
            maxLength={256}
            required
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <Input
            label='Partita IVA'
            value={form.partitaIva ?? ''}
            onChange={e => set('partitaIva', e.target.value)}
            maxLength={32}
          />
          <Input
            label='Codice fiscale'
            value={form.codiceFiscale ?? ''}
            onChange={e => set('codiceFiscale', e.target.value)}
            maxLength={32}
          />
        </div>

        <Input
          label='Indirizzo'
          value={form.indirizzo ?? ''}
          onChange={e => set('indirizzo', e.target.value)}
          maxLength={256}
        />

        <div className='grid grid-cols-3 gap-4'>
          <Input label='CAP' value={form.cap ?? ''} onChange={e => set('cap', e.target.value)} maxLength={16} />
          <Input label='Città' value={form.citta ?? ''} onChange={e => set('citta', e.target.value)} maxLength={128} />
          <Input
            label='Sigla provincia'
            value={form.provincia ?? ''}
            onChange={e => set('provincia', e.target.value.toUpperCase())}
            maxLength={4}
            helperText='Es. TE'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <Input label='Telefono' value={form.telefono ?? ''} onChange={e => set('telefono', e.target.value)} maxLength={64} />
          <Input
            label='Email'
            type='email'
            value={form.email ?? ''}
            onChange={e => set('email', e.target.value)}
            maxLength={64}
          />
        </div>

        <Input label='Referente' value={form.referente ?? ''} onChange={e => set('referente', e.target.value)} maxLength={64} />
        <TextArea label='Note' value={form.note ?? ''} onChange={e => set('note', e.target.value)} rows={3} />

        <Switch label='Attivo' checked={form.isActive ?? true} onCheckedChange={v => set('isActive', v)} />
      </div>
    </Modal>
  );
};

export default AnagraficaFormModal;
