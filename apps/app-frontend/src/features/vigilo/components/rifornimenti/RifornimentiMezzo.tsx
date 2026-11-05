// src/features/vigilo/components/rifornimenti/RifornimentiMezzo.tsx
//
// La scheda Rifornimenti di un veicolo, una macchina o un'attrezzatura
// (tappa 2): dal più recente, data, voce, litri, importo e prezzo al litro
// (solo a chi segue i costi), km o ore letti, fornitore e riferimento.
// Sopra, "Registra rifornimento" (vigilo.write, mezzo non archiviato); dal
// menu della riga Correggi ed Elimina. Gli scontrini stanno in Documenti.
import React, { useState } from 'react';
import { Alert, Button, ConfirmModal, Fuel, Pencil, Table, Trash2, type TableColumn, type TableRowAction } from '@edg/ui';

import { RIGHE_RIFORNIMENTI } from '../../constants/rifornimenti';
import { useRifornimenti } from '../../hooks/useRifornimenti';
import type { Rifornimento } from '../../types/rifornimenti';
import { giornoBreve } from '../../utils/giorni';
import { euroEsatti, letturaTesto, litriTesto, prezzoLitroTesto } from '../../utils/rifornimenti';

const icona = (I: typeof Pencil) => <I className='h-4 w-4' />;
const Vuoto: React.FC = () => <span className='text-text-secondary'>—</span>;

function colonne(conImporto: boolean): TableColumn<Rifornimento>[] {
  return [
    { header: 'Data', accessor: r => <span className='whitespace-nowrap'>{giornoBreve(r.fattoIl)}</span>, className: 'w-32' },
    { header: 'Voce', accessor: r => <span className='font-medium text-text-primary'>{r.nomeVoce}</span> },
    { header: 'Litri', accessor: r => (r.litri != null ? <span className='tabular-nums'>{litriTesto(r.litri)}</span> : <Vuoto />), className: 'text-right' },
    ...(conImporto
      ? [
          {
            header: 'Importo',
            accessor: (r: Rifornimento) => (r.importo != null ? <span className='font-semibold tabular-nums'>{euroEsatti(r.importo)}</span> : <Vuoto />),
            className: 'text-right',
          },
          {
            header: '€/l',
            accessor: (r: Rifornimento) => (r.prezzoAlLitro != null ? <span className='tabular-nums text-text-secondary'>{prezzoLitroTesto(r.prezzoAlLitro)}</span> : <Vuoto />),
            className: 'text-right',
          },
        ]
      : []),
    {
      header: 'Km / ore',
      accessor: r => (r.lettura ? <span className={r.lettura.anomala ? 'tabular-nums text-orange-700 [.dark_&]:text-orange-400' : 'tabular-nums'}>{letturaTesto(r.lettura)}</span> : <Vuoto />),
      className: 'text-right',
    },
    {
      header: 'Fornitore e riferimento',
      accessor: r => {
        const t = [r.fornitore?.nome, r.riferimento].filter(Boolean).join(' · ');
        return (
          <span className='block max-w-72 truncate text-text-secondary' title={[t, r.note].filter(Boolean).join('\n') || undefined}>
            {t || (r.note ? r.note : '—')}
          </span>
        );
      },
    },
  ];
}

interface Props {
  soggetto: string;
  /** vigilo.costi: importo e prezzo al litro */
  conImporto: boolean;
  /** Si può registrare (vigilo.write e mezzo non archiviato) */
  puoRegistrare: boolean;
  /** Cambia dopo un salvataggio fatto fuori (menu Azioni): si rilegge */
  versione: number;
  onRegistra: () => void;
  onCorreggi: (r: Rifornimento) => void;
  onElimina: (r: Rifornimento) => Promise<boolean>;
}

export const RifornimentiMezzo: React.FC<Props> = ({ soggetto, conImporto, puoRegistrare, versione, onRegistra, onCorreggi, onElimina }) => {
  const x = useRifornimenti(soggetto, RIGHE_RIFORNIMENTI, versione);
  const [daEliminare, setDaEliminare] = useState<Rifornimento | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const azioni = (r: Rifornimento): TableRowAction[] =>
    r.modificabile
      ? [
          { id: 'correggi', label: 'Correggi', icon: icona(Pencil), onClick: () => onCorreggi(r) },
          { id: 'elimina', label: 'Elimina', icon: icona(Trash2), variant: 'danger' as const, onClick: () => setDaEliminare(r), divider: true },
        ]
      : [];

  return (
    <div className='space-y-4'>
      {puoRegistrare && (
        <div className='flex justify-end'>
          <Button size='sm' leftIcon={<Fuel className='h-4 w-4' />} onClick={onRegistra}>
            Registra rifornimento
          </Button>
        </div>
      )}
      {x.errore && (
        <Alert variant='danger' title='Impossibile leggere i rifornimenti'>
          {x.errore}
        </Alert>
      )}
      <Table
        data={x.righe}
        columns={colonne(conImporto)}
        keyExtractor={r => r.uuid}
        isLoading={x.caricamento && x.righe.length === 0}
        emptyMessage='Nessun rifornimento finora.'
        striped
        rowActions={x.righe.some(r => r.modificabile) ? { enabled: true, actions: azioni } : undefined}
      />
      {x.altre && (
        <div className='flex justify-center'>
          <Button variant='secondary' onClick={() => void x.mostraAltri()} isLoading={x.caricamento} loadingText='Carico…'>
            Mostra altri ({x.totale - x.righe.length})
          </Button>
        </div>
      )}
      <ConfirmModal
        isOpen={!!daEliminare}
        onClose={() => setDaEliminare(null)}
        onConfirm={async () => {
          if (!daEliminare) return;
          setEliminando(true);
          const ok = await onElimina(daEliminare);
          setEliminando(false);
          if (ok) {
            setDaEliminare(null);
            void x.ricarica();
          }
        }}
        title='Eliminare il rifornimento?'
        message={
          daEliminare
            ? `${daEliminare.nomeVoce} del ${giornoBreve(daEliminare.fattoIl)}: si eliminano anche ${daEliminare.lettura ? 'la lettura del contatore e ' : ''}gli scontrini allegati.`
            : ''
        }
        confirmText='Elimina'
        cancelText='Annulla'
        variant='danger'
        isLoading={eliminando}
        loadingText='Elimino…'
      />
    </div>
  );
};
