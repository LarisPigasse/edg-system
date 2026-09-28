// src/features/sistema/components/LogFilters.tsx
import React from 'react';
import { Input, Select, DatePicker, Button, Tooltip, X, type SelectOption } from '@edg/ui';

import { EVENT_CATEGORY_OPTIONS, EVENT_SEVERITY_OPTIONS, LOG_OUTCOME_OPTIONS } from '../types';
import type { EventCategory, EventSeverity, LogOutcome } from '../types';

/** '' = nessun filtro su quel campo (opzione "Tutti/e"), non fa parte dei valori dell'enum. */
export interface LogFiltersValue {
  search: string;
  categoria: EventCategory | '';
  criticita: EventSeverity | '';
  esito: LogOutcome | '';
  userId: string;
  tenantId: string;
  startDate?: Date;
  endDate?: Date;
}

export const EMPTY_LOG_FILTERS: LogFiltersValue = {
  search: '',
  categoria: '',
  criticita: '',
  esito: '',
  userId: '',
  tenantId: '',
  startDate: undefined,
  endDate: undefined,
};

const CATEGORIA_OPTIONS: SelectOption[] = [{ value: '', label: 'Tutte le categorie' }, ...EVENT_CATEGORY_OPTIONS];
const CRITICITA_OPTIONS: SelectOption[] = [{ value: '', label: 'Tutte le criticità' }, ...EVENT_SEVERITY_OPTIONS];
const ESITO_OPTIONS: SelectOption[] = [{ value: '', label: 'Tutti gli esiti' }, ...LOG_OUTCOME_OPTIONS];

interface LogFiltersProps {
  value: LogFiltersValue;
  onChange: (patch: Partial<LogFiltersValue>) => void;
  onReset: () => void;
  /**
   * Opzioni già risolte in etichette leggibili (nome operatore/ragione
   * sociale, o email/id in fallback — vedi LogsPage) — "Tutti gli utenti"
   * viene aggiunto qui. Il value resta l'origine.id grezzo: è quello che il
   * backend si aspetta nel filtro (vedi buildQuery in logController.ts).
   */
  utenteOptions: SelectOption[];
  /** Tenant attivi (da useTenantDirectory) — "Tutti i tenant" viene aggiunto qui. */
  tenantOptions: SelectOption[];
}

/**
 * Barra filtri della pagina Logs: componente controllato, nessuno stato
 * proprio (a parte l'apertura dei popup di Select/DatePicker, interna a
 * quei componenti) — il debounce della ricerca testuale e il fetch restano
 * a LogsPage, stesso schema di AccountPage con useDebouncedValue.
 */
const LogFilters: React.FC<LogFiltersProps> = ({ value, onChange, onReset, utenteOptions, tenantOptions }) => {
  const utenteSelectOptions: SelectOption[] = [{ value: '', label: 'Tutti gli utenti' }, ...utenteOptions];
  const tenantSelectOptions: SelectOption[] = [{ value: '', label: 'Tutti i tenant' }, ...tenantOptions];

  return (
    <div className='flex flex-wrap items-end gap-4'>
      <div className='w-64'>
        <Input label='Cerca' value={value.search} onChange={e => onChange({ search: e.target.value })} />
      </div>
      <div className='w-48'>
        <Select
          label='Categoria'
          options={CATEGORIA_OPTIONS}
          value={value.categoria}
          onValueChange={v => onChange({ categoria: v as EventCategory | '' })}
          optionSize='sm'
        />
      </div>
      <div className='w-48'>
        <Select
          label='Criticità'
          options={CRITICITA_OPTIONS}
          value={value.criticita}
          onValueChange={v => onChange({ criticita: v as EventSeverity | '' })}
          optionSize='sm'
        />
      </div>
      <div className='w-40'>
        <Select
          label='Esito'
          options={ESITO_OPTIONS}
          value={value.esito}
          onValueChange={v => onChange({ esito: v as LogOutcome | '' })}
          optionSize='sm'
        />
      </div>
      <div className='w-48'>
        <Select
          label='Utente'
          options={utenteSelectOptions}
          value={value.userId}
          onValueChange={v => onChange({ userId: v })}
          optionSize='sm'
        />
      </div>
      <div className='w-48'>
        <Select
          label='Tenant'
          options={tenantSelectOptions}
          value={value.tenantId}
          onValueChange={v => onChange({ tenantId: v })}
          optionSize='sm'
        />
      </div>
      <div className='w-36'>
        <DatePicker label='Dal' value={value.startDate} onChange={date => onChange({ startDate: date })} />
      </div>
      <div className='w-36'>
        <DatePicker label='Al' value={value.endDate} onChange={date => onChange({ endDate: date })} />
      </div>
      {/* ml-auto: sulla riga in cui si trova, resta sempre ancorato al bordo
          destro — anche quando i filtri prima di lui vanno a capo (stesso
          schema del refresh in PageHeader: icona sola + Tooltip). */}
      <Tooltip content='Azzera filtri' side='bottom'>
        <Button variant='outline' onClick={onReset} className='ml-auto'>
          <X className='w-4 h-4' />
        </Button>
      </Tooltip>
    </div>
  );
};

export default LogFilters;
