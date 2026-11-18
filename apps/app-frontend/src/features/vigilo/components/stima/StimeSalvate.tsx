// src/features/vigilo/components/stima/StimeSalvate.tsx
//
// La scheda "Stime salvate" (2026-11-18, fase 3): le stime più recenti per
// prime, con quanto (km o ore), totale stimato, costo reale e scostamento. Il
// clic apre il dettaglio (costo reale, PDF, duplica come nuova); dal menu
// della riga si elimina, se l'ha salvata chi guarda o se ha write.
import React, { useState } from 'react';
import { Alert, ConfirmModal, Skeleton, Table, type TableColumn } from '@edg/ui';

import { useStimeSalvate } from '../../hooks/useStimeSalvate';
import type { StimaRiga, StimaSalvata } from '../../types/stima';
import { aGiorno, giornoBreve } from '../../utils/giorni';
import { euroCentesimi } from '../../utils/resoconti';
import { DettaglioStima } from './DettaglioStima';
import { TestoScostamento } from './TestoScostamento';

const numero = (n: number) => n.toLocaleString('it-IT', { maximumFractionDigits: 1 });

const colonne: TableColumn<StimaRiga>[] = [
  { header: 'Data', accessor: s => giornoBreve(aGiorno(new Date(s.salvataIl))) },
  {
    header: 'Servizio',
    accessor: s => (
      <span>
        <span className='font-medium'>{s.descrizione}</span>
        <span className='block text-xs text-text-secondary'>{[s.mezzo, s.persona].filter(Boolean).join(' · ') || '—'}</span>
      </span>
    ),
  },
  { header: 'Quanto', accessor: s => <span className='tabular-nums'>{s.kmTotali !== null ? `${numero(s.kmTotali)} km` : s.oreServizio !== null ? `${numero(s.oreServizio)} h` : '—'}</span>, align: 'right' },
  { header: 'Stimato', accessor: s => <span className='font-semibold tabular-nums text-action-primary'>{euroCentesimi(s.totale)}</span>, align: 'right' },
  { header: 'Reale', accessor: s => <span className='tabular-nums'>{s.costoReale == null ? '—' : euroCentesimi(s.costoReale)}</span>, align: 'right' },
  { header: 'Scostamento', accessor: s => <TestoScostamento scostamento={s.scostamento} />, align: 'right' },
  { header: 'Salvata da', accessor: s => <span className='text-text-secondary'>{s.salvataDa ?? '—'}</span>, className: 'hidden md:table-cell' },
];

export const StimeSalvate: React.FC<{ onDuplica: (s: StimaSalvata) => void }> = ({ onDuplica }) => {
  const x = useStimeSalvate();
  const [daEliminare, setDaEliminare] = useState<StimaRiga | null>(null);

  if (x.errore && !x.righe)
    return (
      <Alert variant='danger' title='Stime non lette'>
        {x.errore}
      </Alert>
    );
  if (!x.righe) return <Skeleton className='h-64 w-full' />;

  return (
    <>
      <Table
        data={x.righe}
        columns={colonne}
        keyExtractor={s => s.uuid}
        emptyMessage='Nessuna stima salvata: calcolane una in Nuova stima e premi Salva.'
        onRowClick={s => void x.apri(s.uuid)}
        rowActions={{
          enabled: true,
          quickActions: { delete: { enabled: true, onDelete: s => setDaEliminare(s), canDelete: s => s.eliminabile, requireConfirmation: false } },
        }}
      />
      <DettaglioStima stima={x.aperta} inCorso={x.inCorso} onChiudi={x.chiudi} onReale={x.reale} onDuplica={onDuplica} />
      <ConfirmModal
        isOpen={!!daEliminare}
        onClose={() => setDaEliminare(null)}
        onConfirm={async () => {
          if (daEliminare && (await x.elimina(daEliminare.uuid))) setDaEliminare(null);
        }}
        title={`Eliminare la stima "${daEliminare?.descrizione ?? ''}"?`}
        message='Si perdono anche il costo reale e lo scostamento.'
        confirmText='Elimina'
        variant='danger'
        isLoading={x.inCorso}
      />
    </>
  );
};
