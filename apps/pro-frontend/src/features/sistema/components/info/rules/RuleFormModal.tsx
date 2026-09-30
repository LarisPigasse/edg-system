// src/features/sistema/components/info/rules/RuleFormModal.tsx
//
// Creazione/modifica di una regola di allarme (ADR038), in tre blocchi:
//   1. Quali eventi   — tipo di evento, criticita' (+ categoria ed esito in "Altri filtri")
//   2. Quando scatta  — soglia, finestra, raggruppamento, pausa tra allarmi
//   3. Notifica       — gravita' (vuoto = dall'evento) e destinatari (vuoto = predefiniti)
// In fondo la frase descrittiva (describeRule) si aggiorna mentre si compila.
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, MultiSelect, Select, Switch, TextArea, type SelectOption } from '@edg/ui';

import { EVENT_CATEGORY_OPTIONS, EVENT_SEVERITY_OPTIONS, LOG_OUTCOME_OPTIONS } from '../../../types';
import { GROUP_BY_OPTIONS, RULE_SEVERITY_OPTIONS, describeRule } from '../../../utils/alertFormat';
import type {
  AlertGroupBy,
  AlertRecipient,
  AlertRule,
  AlertRuleInput,
  AlertSeverity,
  EventTypeOption,
} from '../../../types/info';

const EMPTY_FORM: AlertRuleInput = {
  name: '',
  description: null,
  enabled: true,
  conditions: { categoria: null, sottoCategoria: null, criticita: null, esito: null, origineId: null },
  threshold: { count: 1, windowMinutes: 0 },
  groupBy: null,
  recipientIds: [],
  cooldownMinutes: 32,
  severity: null,
};

const toForm = (r: AlertRule): AlertRuleInput => ({
  name: r.name,
  description: r.description,
  enabled: r.enabled,
  conditions: { ...EMPTY_FORM.conditions, ...r.conditions },
  threshold: { ...r.threshold },
  groupBy: r.groupBy,
  recipientIds: [...(r.recipientIds ?? [])],
  cooldownMinutes: r.cooldownMinutes,
  severity: r.severity ?? null,
});

const withAny = (label: string, options: readonly { value: string; label: string }[]): SelectOption[] => [
  { value: '', label },
  ...options,
];

/** Intero >= min da un campo numerico (vuoto o non valido -> min) */
const toInt = (value: string, min: number) => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) ? Math.max(min, n) : min;
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className='flex flex-col gap-3'>
    <h4 className='text-xs font-semibold uppercase tracking-wider text-text-secondary'>{title}</h4>
    {children}
  </section>
);

interface RuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: AlertRuleInput) => Promise<void>;
  isSaving: boolean;
  item: AlertRule | null; // null = creazione
  eventTypes: EventTypeOption[];
  recipients: AlertRecipient[];
}

const RuleFormModal: React.FC<RuleFormModalProps> = ({ isOpen, onClose, onSave, isSaving, item, eventTypes, recipients }) => {
  const [form, setForm] = useState<AlertRuleInput>(EMPTY_FORM);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const next = item ? toForm(item) : EMPTY_FORM;
    setForm(next);
    setShowMoreFilters(!!(next.conditions.categoria || next.conditions.esito));
  }, [isOpen, item]);

  const setConditions = (patch: Partial<AlertRuleInput['conditions']>) =>
    setForm(f => ({ ...f, conditions: { ...f.conditions, ...patch } }));
  const setThreshold = (patch: Partial<AlertRuleInput['threshold']>) =>
    setForm(f => ({ ...f, threshold: { ...f.threshold, ...patch } }));

  const eventTypeOptions: SelectOption[] = useMemo(() => {
    const options = eventTypes.map(t => ({ value: t.value, label: t.label ? `${t.label} — ${t.value}` : t.value }));
    // Una regola esistente puo' usare un tipo non (piu') in elenco: resta selezionabile
    const current = form.conditions.sottoCategoria;
    if (current && !options.some(o => o.value === current)) options.push({ value: current, label: current });
    return [{ value: '', label: 'Qualsiasi tipo di evento' }, ...options];
  }, [eventTypes, form.conditions.sottoCategoria]);

  const recipientOptions = recipients.map(r => ({
    value: r._id,
    label: `${r.name} <${r.email}>${r.enabled ? '' : ' (disattivato)'}`,
  }));

  const isMulti = form.threshold.count > 1;
  const nameMissing = form.name.trim() === '';
  const windowMissing = isMulti && form.threshold.windowMinutes < 1;
  const canSave = !nameMissing && !windowMissing;

  const handleSave = () => {
    if (!canSave) return;
    void onSave({
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || null,
      // soglia 1 = immediata: la finestra non ha significato
      threshold: isMulti ? form.threshold : { count: 1, windowMinutes: 0 },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Modifica regola' : 'Nuova regola'}
      size='xl'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose} disabled={isSaving}>
            Annulla
          </Button>
          <Button variant='primary' onClick={handleSave} disabled={!canSave} isLoading={isSaving} loadingText='Salvataggio...'>
            Salva
          </Button>
        </div>
      }
    >
      <div className='flex flex-col gap-6'>
        {item?.systemKey && (
          <p className='rounded-md bg-surface-2 px-3 py-2 text-sm text-text-secondary'>
            Regola predefinita: puoi modificarla o disattivarla, ma non eliminarla.
          </p>
        )}

        <div className='flex flex-col gap-3'>
          <Input
            label='Nome'
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            maxLength={128}
            error={nameMissing ? 'Il nome è obbligatorio' : undefined}
            required
          />
          <TextArea
            label='Descrizione'
            value={form.description ?? ''}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            helperText='Compare anche nel testo dell’email di allarme'
            maxLength={512}
            autoResize
            minRows={2}
          />
          <Switch
            label='Regola attiva'
            checked={form.enabled}
            onCheckedChange={checked => setForm(f => ({ ...f, enabled: checked }))}
          />
        </div>

        <Section title='Quali eventi'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <Select
              label='Tipo di evento'
              options={eventTypeOptions}
              value={form.conditions.sottoCategoria ?? ''}
              onValueChange={v => setConditions({ sottoCategoria: v || null })}
            />
            <Select
              label='Criticità'
              options={withAny('Qualsiasi criticità', EVENT_SEVERITY_OPTIONS)}
              value={form.conditions.criticita ?? ''}
              onValueChange={v => setConditions({ criticita: v || null })}
            />
          </div>
          {showMoreFilters ? (
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <Select
                label='Categoria'
                options={withAny('Qualsiasi categoria', EVENT_CATEGORY_OPTIONS)}
                value={form.conditions.categoria ?? ''}
                onValueChange={v => setConditions({ categoria: v || null })}
              />
              <Select
                label='Esito'
                options={withAny('Qualsiasi esito', LOG_OUTCOME_OPTIONS)}
                value={form.conditions.esito ?? ''}
                onValueChange={v => setConditions({ esito: (v || null) as AlertRuleInput['conditions']['esito'] })}
              />
            </div>
          ) : (
            <div>
              <Button variant='link' size='xs' onClick={() => setShowMoreFilters(true)}>
                Altri filtri (categoria, esito)
              </Button>
            </div>
          )}
        </Section>

        <Section title='Quando scatta'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <Input
              label='Numero di eventi'
              type='number'
              min={1}
              value={String(form.threshold.count)}
              onChange={e => setThreshold({ count: toInt(e.target.value, 1) })}
              helperText='1 = a ogni evento'
            />
            <Input
              label='Finestra (minuti)'
              type='number'
              min={1}
              value={isMulti ? String(form.threshold.windowMinutes) : ''}
              onChange={e => setThreshold({ windowMinutes: toInt(e.target.value, 0) })}
              disabled={!isMulti}
              error={windowMissing ? 'Indica in quanti minuti contare gli eventi' : undefined}
              helperText={isMulti ? undefined : 'Serve solo con più di un evento'}
            />
            <Select
              label='Raggruppa'
              options={GROUP_BY_OPTIONS}
              value={form.groupBy ?? ''}
              onValueChange={v => setForm(f => ({ ...f, groupBy: (v || null) as AlertGroupBy | null }))}
            />
            <Input
              label='Pausa tra due allarmi (minuti)'
              type='number'
              min={0}
              value={String(form.cooldownMinutes)}
              onChange={e => setForm(f => ({ ...f, cooldownMinutes: toInt(e.target.value, 0) }))}
              helperText='0 = nessuna pausa'
            />
          </div>
        </Section>

        <Section title='Notifica'>
          <Select
            label='Gravità dell’allarme'
            options={RULE_SEVERITY_OPTIONS}
            value={form.severity ?? ''}
            onValueChange={v => setForm(f => ({ ...f, severity: (v || null) as AlertSeverity | null }))}
            helperText='Fissala quando conta la ripetizione più del singolo evento'
          />
          <MultiSelect
            label='Destinatari'
            options={recipientOptions}
            value={form.recipientIds}
            onChange={ids => setForm(f => ({ ...f, recipientIds: ids }))}
            placeholder='Destinatari predefiniti'
            helperText='Nessuna selezione = i destinatari marcati come predefiniti'
          />
        </Section>

        <p className='rounded-md border border-surface-border bg-surface-2 px-3 py-2 text-sm text-text-primary'>
          {describeRule({ ...form, threshold: isMulti ? form.threshold : { count: 1, windowMinutes: 0 } })}
        </p>
      </div>
    </Modal>
  );
};

export default RuleFormModal;
