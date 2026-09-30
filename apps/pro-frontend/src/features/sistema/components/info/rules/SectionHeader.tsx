// src/features/sistema/components/info/rules/SectionHeader.tsx
//
// Intestazione di una sezione della scheda Regole: titolo, conteggio e azione
// di creazione — stessa tipografia delle sezioni della scheda Salute.
import React from 'react';
import { CreateAction } from '@edg/ui';

interface SectionHeaderProps {
  title: string;
  count?: number;
  createLabel: string;
  onCreate: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count, createLabel, onCreate }) => (
  <div className='flex items-end justify-between gap-4'>
    <div className='flex items-baseline gap-2'>
      <h3 className='text-xs font-semibold uppercase tracking-wider text-text-secondary'>{title}</h3>
      {count !== undefined && <span className='text-xs tabular-nums text-text-secondary'>{count}</span>}
    </div>
    <CreateAction onClick={onCreate} label={createLabel} />
  </div>
);

export default SectionHeader;
