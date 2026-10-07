// src/features/sistema/components/tenant/ActivationFormModal.tsx
//
// Una sola finestra per tutte le operazioni con un periodo (ADR048):
//   trial       avvia una prova (fine obbligatoria, proposta: inizio + giorni di prova)
//   activate    attiva (nuovo modulo, o prova che diventa contratto)
//   reactivate  riattiva un modulo sospeso o scaduto (prova o attivo)
//   edit        proroga o modifica periodo, stato e note
// Si scelgono giorni, non orari: la fine vale per tutto il giorno scelto
// (vedi utils/activationDates). Le regole vere le applica auth-service.
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Input, Select, Switch, DatePicker } from '@edg/ui';

import type { ActivationStatus, TenantModuleView } from '../../types/modules';
import { addDays, endOfDay, formatDate, startOfDay } from '../../utils/activationDates';

export type ActivationMode = 'trial' | 'activate' | 'reactivate' | 'edit';

/** Dati raccolti dalla finestra, già nel formato delle API */
export interface ActivationFormResult {
  status: 'prova' | 'attivo' | 'sospeso';
  startsAt: string;
  endsAt: string | null;
  notes: string | null;
}

interface ActivationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (result: ActivationFormResult) => Promise<void>;
  isSaving: boolean;
  mode: ActivationMode;
  view: TenantModuleView | null;
}

const TITLES: Record<ActivationMode, string> = {
  trial: 'Avvia prova',
  activate: 'Attiva modulo',
  reactivate: 'Riattiva modulo',
  edit: 'Modifica attivazione',
};

const STATUS_OPTIONS: Record<ActivationMode, { value: ActivationFormResult['status']; label: string }[]> = {
  trial: [{ value: 'prova', label: 'In prova' }],
  activate: [{ value: 'attivo', label: 'Attivo' }],
  reactivate: [
    { value: 'attivo', label: 'Attivo' },
    { value: 'prova', label: 'In prova' },
  ],
  edit: [
    { value: 'prova', label: 'In prova' },
    { value: 'attivo', label: 'Attivo' },
    { value: 'sospeso', label: 'Sospeso' },
  ],
};

/** Stato iniziale proposto per ogni modalità */
function initialStatus(mode: ActivationMode, current: ActivationStatus | undefined): ActivationFormResult['status'] {
  if (mode === 'trial') return 'prova';
  if (mode === 'activate' || mode === 'reactivate') return 'attivo';
  return current === 'scaduto' || !current ? 'attivo' : current;
}

const ActivationFormModal: React.FC<ActivationFormModalProps> = ({ isOpen, onClose, onSubmit, isSaving, mode, view }) => {
  const [status, setStatus] = useState<ActivationFormResult['status']>('prova');
  const [start, setStart] = useState<Date | undefined>(undefined);
  const [end, setEnd] = useState<Date | undefined>(undefined);
  const [hasEnd, setHasEnd] = useState(true);
  const [notes, setNotes] = useState('');
  const [touched, setTouched] = useState(false);

  const trialDays = view?.module.trialDays ?? 32;
  const activation = view?.activation ?? null;

  // Proposta di fine prova: l'ultimo giorno incluso è inizio + giorni di prova - 1
  const trialEnd = (from: Date) => addDays(startOfDay(from), trialDays - 1);

  useEffect(() => {
    if (!isOpen || !view) return;
    const today = startOfDay(new Date());
    const nextStatus = initialStatus(mode, activation?.status);
    // In modifica si parte dal periodo attuale; altrimenti da oggi
    const s = mode === 'edit' && activation ? new Date(activation.startsAt) : today;
    const e =
      mode === 'edit' && activation?.endsAt
        ? new Date(activation.endsAt)
        : nextStatus === 'prova'
          ? trialEnd(s)
          : undefined;
    setStatus(nextStatus);
    setStart(s);
    setEnd(e);
    setHasEnd(nextStatus === 'prova' || !!e);
    setNotes(mode === 'edit' || mode === 'reactivate' ? (activation?.notes ?? '') : '');
    setTouched(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, view, mode]);

  // La prova ha sempre una fine: passando a "In prova" la si propone
  const changeStatus = (next: ActivationFormResult['status']) => {
    setStatus(next);
    if (next === 'prova') {
      setHasEnd(true);
      if (!end && start) setEnd(trialEnd(start));
    }
  };

  const needsEnd = status === 'prova' || (status === 'attivo' && hasEnd);
  const granting = status !== 'sospeso';

  const error = useMemo((): string | null => {
    if (!start) return "Indica la data d'inizio";
    if (needsEnd && !end) return 'Indica la data di fine';
    if (needsEnd && end && startOfDay(end) < startOfDay(start)) return "La fine non può essere prima dell'inizio";
    if (granting && needsEnd && end && endOfDay(end) < new Date()) return 'La data di fine è già passata';
    return null;
  }, [start, end, needsEnd, granting]);

  const submit = () => {
    setTouched(true);
    if (error || !start) return;
    void onSubmit({
      status,
      startsAt: startOfDay(start).toISOString(),
      endsAt: needsEnd && end ? endOfDay(end).toISOString() : null,
      notes: notes.trim() || null,
    });
  };

  const options = STATUS_OPTIONS[mode];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${TITLES[mode]} — ${view?.module.name ?? ''}`}
      size='md'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose} disabled={isSaving}>
            Annulla
          </Button>
          <Button variant='primary' onClick={submit} isLoading={isSaving} loadingText='Salvataggio...'>
            Conferma
          </Button>
        </div>
      }
    >
      <div className='space-y-4'>
        {options.length > 1 && (
          <Select
            label='Stato'
            options={options}
            value={status}
            onValueChange={v => changeStatus(v as ActivationFormResult['status'])}
            helperText={
              status === 'sospeso'
                ? "Il tenant perde l'accesso al modulo; i dati restano"
                : status === 'prova'
                  ? 'Periodo di prova con data di fine obbligatoria'
                  : 'Contratto attivo, con o senza scadenza'
            }
          />
        )}

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <DatePicker label='Inizio' value={start} onChange={setStart} required />
          {needsEnd && (
            <DatePicker
              label='Fine (giorno incluso)'
              value={end}
              onChange={setEnd}
              minDate={start}
              required
              helperText={status === 'prova' ? `Prova standard: ${trialDays} giorni` : undefined}
            />
          )}
        </div>

        {status === 'attivo' && (
          <Switch
            label='Con scadenza'
            description='Attiva per un contratto a tempo: alla fine il modulo scade da solo'
            checked={hasEnd}
            onCheckedChange={v => {
              setHasEnd(v);
              if (v && !end && start) setEnd(addDays(start, 364));
            }}
          />
        )}

        <Input
          label='Note'
          value={notes}
          onChange={e => setNotes(e.target.value)}
          maxLength={256}
          helperText='Riferimento commerciale o motivo (facoltativo)'
        />

        {mode === 'edit' && activation?.endsAt && (
          <p className='text-xs text-text-secondary'>Scadenza attuale: {formatDate(activation.endsAt)}</p>
        )}

        {touched && error && <p className='text-sm text-text-error'>{error}</p>}
      </div>
    </Modal>
  );
};

export default ActivationFormModal;
