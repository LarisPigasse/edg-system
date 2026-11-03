// src/features/vigilo/components/fornitori/TabellaFornitori.tsx
//
// La tabella dei fornitori (F1): nome (con "disattivato"), tipo, telefono
// (si chiama con un tocco), quante registrazioni lo citano e l'ultima. Email,
// indirizzo e referente stanno nel dettaglio, che si apre col clic sulla riga.
// Con vigilo.write il menu della riga: Modifica, Disattiva/Riattiva ed
// Elimina (solo se nessuna registrazione lo cita).
import React from 'react';
import { Badge, Button, Pencil, Play, Power, Table, Trash2, type TableColumn, type TableRowAction } from '@edg/ui';

import type { ElencoFornitori } from '../../hooks/useElencoFornitori';
import type { Fornitore } from '../../types/fornitori';
import { giornoBreve } from '../../utils/giorni';

const icona = (I: typeof Pencil) => <I className='h-4 w-4' />;

const colonne: TableColumn<Fornitore>[] = [
  {
    header: 'Nome',
    accessor: f => (
      <span className='flex min-w-0 items-center gap-2'>
        <span className={f.attivo ? 'truncate font-medium text-text-primary' : 'truncate font-medium text-text-secondary'}>{f.nome}</span>
        {!f.attivo && <Badge variant='default'>disattivato</Badge>}
      </span>
    ),
  },
  {
    header: 'Tipo',
    accessor: f => <span className={f.tipo?.attivo === false ? 'text-text-secondary' : undefined}>{f.tipo?.nome ?? '—'}</span>,
  },
  {
    header: 'Telefono',
    accessor: f =>
      f.telefono ? (
        <a href={`tel:${f.telefono.replace(/\s+/g, '')}`} onClick={ev => ev.stopPropagation()} className='whitespace-nowrap text-text-link hover:underline'>
          {f.telefono}
        </a>
      ) : (
        '—'
      ),
  },
  {
    header: 'Registrazioni',
    accessor: f =>
      f.registrazioni ? (
        <span className='whitespace-nowrap'>
          {f.registrazioni}
          {f.ultimaIl && <span className='text-text-secondary'> · ultima il {giornoBreve(f.ultimaIl)}</span>}
        </span>
      ) : (
        <span className='text-text-secondary'>nessuna</span>
      ),
  },
];

interface Props {
  e: ElencoFornitori;
  /** Con vigilo.write: il menu della riga */
  modificabile: boolean;
  onApri: (f: Fornitore) => void;
  onModifica: (f: Fornitore) => void;
  onAttiva: (f: Fornitore, attivo: boolean) => void;
  onElimina: (f: Fornitore) => void;
}

export const TabellaFornitori: React.FC<Props> = ({ e, modificabile, onApri, onModifica, onAttiva, onElimina }) => {
  const azioni = (f: Fornitore): TableRowAction[] => [
    { id: 'modifica', label: 'Modifica', icon: icona(Pencil), onClick: () => onModifica(f) },
    f.attivo
      ? { id: 'disattiva', label: 'Disattiva', icon: icona(Power), onClick: () => onAttiva(f, false), divider: !f.registrazioni }
      : { id: 'riattiva', label: 'Riattiva', icon: icona(Play), onClick: () => onAttiva(f, true), divider: !f.registrazioni },
    // citato in registrazioni: si può solo disattivare
    ...(f.registrazioni ? [] : [{ id: 'elimina', label: 'Elimina', icon: icona(Trash2), variant: 'danger' as const, onClick: () => onElimina(f) }]),
  ];

  return (
    <div className='space-y-4'>
      <Table
        data={e.righe}
        columns={colonne}
        keyExtractor={f => f.uuid}
        isLoading={e.caricamento && e.righe.length === 0}
        emptyMessage={e.filtriAttivi ? 'Nessun fornitore con questi filtri.' : 'Nessun fornitore in rubrica.'}
        striped
        hoverable
        onRowClick={onApri}
        rowActions={modificabile ? { enabled: true, actions: azioni } : undefined}
      />
      {e.altre && (
        <div className='flex justify-center'>
          <Button variant='secondary' onClick={() => void e.mostraAltri()} isLoading={e.caricamento} loadingText='Carico…'>
            Mostra altri ({e.totale - e.righe.length})
          </Button>
        </div>
      )}
    </div>
  );
};
