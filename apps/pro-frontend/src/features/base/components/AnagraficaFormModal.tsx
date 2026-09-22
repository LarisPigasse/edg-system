// src/features/base/components/AnagraficaFormModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Button, Input, Select, Switch, TextArea, type SelectOption } from '@edg/ui';

import { useTenantDirectory } from '../api/useTenantDirectory';
import type { Anagrafica, AnagraficaInput, TipoAnagrafica } from '../types';
import { TIPO_ANAGRAFICA_LABELS } from '../types';

interface AnagraficaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: AnagraficaInput) => Promise<void>;
  isSaving: boolean;
  item: Anagrafica | null; // null = creazione
}

const emptyForm = (): AnagraficaInput => ({
  tipo: 'cliente',
  idTenant: 0,
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

const AnagraficaFormModal: React.FC<AnagraficaFormModalProps> = ({ isOpen, onClose, onSave, isSaving, item }) => {
  const [form, setForm] = useState<AnagraficaInput>(emptyForm());

  // Tenant proposti: qualunque tenant attivo, incluso quello di sistema.
  // Un'anagrafica non implica un accesso proprio alla piattaforma: un
  // cliente gestito interamente da Express Delivery (spedizioni comprese,
  // quando esisterà quel modulo), senza mai fare login, appartiene
  // semplicemente al tenant di sistema. Un tenant dedicato serve solo a chi
  // avrà un proprio accesso con moduli concessi a sé - eventualmente
  // condiviso tra più anagrafiche dello stesso gruppo aziendale. Un nuovo
  // tenant dedicato si crea dalla pagina Tenant, non da qui.
  const { tenants } = useTenantDirectory();
  const tenantOptions: SelectOption[] = tenants.map(t => ({ value: String(t.id), label: t.name }));

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
        : emptyForm()
    );
  }, [isOpen, item]);

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
      <div className='space-y-1'>
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

        <Select
          label='Tenant'
          options={tenantOptions}
          value={form.idTenant ? String(form.idTenant) : undefined}
          onValueChange={v => set('idTenant', Number(v))}
          placeholder='Seleziona il tenant'
          required
          helperText='Il tenant Express Delivery Group è per chi non ha un accesso proprio ed è gestito direttamente da EDG.'
        />

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
            label='Sigla provincia (es. TE)'
            value={form.provincia ?? ''}
            onChange={e => set('provincia', e.target.value.toUpperCase())}
            maxLength={4}
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
        <TextArea label='Note' value={form.note ?? ''} onChange={e => set('note', e.target.value)} rows={2} />

        <Switch label='Attivo' checked={form.isActive ?? true} onCheckedChange={v => set('isActive', v)} />
      </div>
    </Modal>
  );
};

export default AnagraficaFormModal;
