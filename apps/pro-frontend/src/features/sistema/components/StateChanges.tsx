// src/features/sistema/components/StateChanges.tsx
//
// Stato prima/dopo di un evento di audit in forma leggibile (ADR039, punto 2),
// al posto dei blocchi JSON grezzi:
//   - modifica     -> tabella Campo · Prima · Dopo, solo i campi cambiati
//                     (diff calcolato da log-service, utils/diffUtils.ts)
//   - creazione    -> valori iniziali (solo "nuovo")
//   - eliminazione -> valori prima dell'eliminazione (solo "precedente")
// I campi sensibili non arrivano mai qui: li toglie snapshot() nei logger.
import React from 'react';

type Snapshot = Record<string, unknown> | null;

interface DiffEntry {
  from?: unknown;
  to?: unknown;
  added?: unknown;
  removed?: unknown;
}

/** Valore di un campo in forma compatta */
const Value: React.FC<{ value: unknown }> = ({ value }) => {
  if (value === null || value === undefined || value === '') return <span className='text-text-secondary'>—</span>;
  if (typeof value === 'boolean') return <>{value ? 'Sì' : 'No'}</>;
  if (typeof value === 'object') return <code className='font-mono text-xs'>{JSON.stringify(value)}</code>;
  return <>{String(value)}</>;
};

const Th: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th className='px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary'>{children}</th>
);

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className='w-full overflow-x-auto rounded-md border border-surface-border'>
    <table className='w-full text-sm'>{children}</table>
  </div>
);

/** Modifica: solo i campi cambiati */
const DiffTable: React.FC<{ diff: Record<string, DiffEntry> }> = ({ diff }) => (
  <Frame>
    <thead className='bg-surface-2'>
      <tr>
        <Th>Campo</Th>
        <Th>Prima</Th>
        <Th>Dopo</Th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(diff).map(([field, d]) => (
        <tr key={field} className='border-t border-surface-border'>
          <td className='px-3 py-1.5 font-mono text-xs text-text-secondary'>{field}</td>
          <td className='px-3 py-1.5 text-text-danger'>
            <Value value={'removed' in d ? d.removed : 'from' in d ? d.from : null} />
          </td>
          <td className='px-3 py-1.5 text-text-success'>
            <Value value={'added' in d ? d.added : 'to' in d ? d.to : null} />
          </td>
        </tr>
      ))}
    </tbody>
  </Frame>
);

/** Creazione o eliminazione: tutti i valori di un solo stato */
const ValuesTable: React.FC<{ values: Record<string, unknown> }> = ({ values }) => (
  <Frame>
    <tbody>
      {Object.entries(values).map(([field, value]) => (
        <tr key={field} className='border-t border-surface-border first:border-t-0'>
          <td className='w-1/3 px-3 py-1.5 font-mono text-xs text-text-secondary'>{field}</td>
          <td className='px-3 py-1.5'>
            <Value value={value} />
          </td>
        </tr>
      ))}
    </tbody>
  </Frame>
);

export interface StateChangesContent {
  label: string;
  content: React.ReactNode;
}

/**
 * Etichetta e contenuto della sezione "Modifiche" per un evento, oppure null
 * se l'evento non porta uno stato utile.
 */
export function stateChanges(stato: { precedente: Snapshot; nuovo: Snapshot; diff: Record<string, unknown> | null } | undefined): StateChangesContent | null {
  if (!stato) return null;
  const { precedente, nuovo, diff } = stato;

  if (diff && Object.keys(diff).length > 0) {
    return { label: 'Campi modificati', content: <DiffTable diff={diff as Record<string, DiffEntry>} /> };
  }
  if (precedente && nuovo) {
    return { label: 'Campi modificati', content: <span className='text-text-secondary'>Nessun campo cambiato</span> };
  }
  if (nuovo) return { label: 'Valori iniziali', content: <ValuesTable values={nuovo} /> };
  if (precedente) return { label: 'Valori eliminati', content: <ValuesTable values={precedente} /> };
  return null;
}
