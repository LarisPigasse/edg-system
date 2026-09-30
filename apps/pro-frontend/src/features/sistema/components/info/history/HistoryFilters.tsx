// src/features/sistema/components/info/history/HistoryFilters.tsx
//
// Filtri dello Storico degli allarmi (ADR038): regola, gravita', esito, periodo.
// Stessa disposizione e stessi controlli dei filtri della pagina Logs.
import React from 'react';
import { Button, DatePicker, Select, Tooltip, X, type SelectOption } from '@edg/ui';

import { ALERT_SEVERITY_OPTIONS, ALERT_STATUS_OPTIONS } from '../../../utils/alertFormat';
import type { AlertHistoryFilters } from '../../../hooks/useAlertHistory';

interface HistoryFiltersProps {
  value: AlertHistoryFilters;
  onChange: (patch: Partial<AlertHistoryFilters>) => void;
  onReset: () => void;
  ruleOptions: SelectOption[];
}

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({ value, onChange, onReset, ruleOptions }) => (
  <div className='flex flex-wrap items-end gap-4'>
    <div className='w-72'>
      <Select
        label='Regola'
        options={[{ value: '', label: 'Tutte le regole' }, ...ruleOptions]}
        value={value.ruleId}
        onValueChange={v => onChange({ ruleId: v })}
        optionSize='sm'
      />
    </div>
    <div className='w-44'>
      <Select
        label='Gravità'
        options={ALERT_SEVERITY_OPTIONS}
        value={value.severity}
        onValueChange={v => onChange({ severity: v as AlertHistoryFilters['severity'] })}
        optionSize='sm'
      />
    </div>
    <div className='w-40'>
      <Select
        label='Esito'
        options={ALERT_STATUS_OPTIONS}
        value={value.status}
        onValueChange={v => onChange({ status: v as AlertHistoryFilters['status'] })}
        optionSize='sm'
      />
    </div>
    <div className='w-36'>
      <DatePicker label='Dal' value={value.startDate} onChange={date => onChange({ startDate: date })} />
    </div>
    <div className='w-36'>
      <DatePicker label='Al' value={value.endDate} onChange={date => onChange({ endDate: date })} />
    </div>
    <Tooltip content='Azzera filtri' side='bottom'>
      <Button variant='outline' onClick={onReset} className='ml-auto'>
        <X className='h-4 w-4' />
      </Button>
    </Tooltip>
  </div>
);

export default HistoryFilters;
