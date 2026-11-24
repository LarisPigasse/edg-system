// src/features/vigilo/components/stima/ParametriStima.tsx
//
// La scheda Parametri della stima dei costi (2026-11-17): i parametri
// generali (conducente, tempi di guida, pedaggi) e i costi aziendali per
// anno, a consuntivo o a preventivo, con il costo per ora di servizio. L'anno
// che la stima usa oggi è segnato. Modifiche nei pannelli laterali, solo a
// chi ha vigilo.write (e i costi, già richiesti dalla pagina).
import React, { useState } from 'react';
import { Alert, Button, ConfirmModal, Plus, Skeleton, Table, type TableColumn } from '@edg/ui';

import { useParametriStima } from '../../hooks/useParametriStima';
import type { CostiAnno, RegoleStima } from '../../types/stima';
import { aGiorno, giornoBreve } from '../../utils/giorni';
import { costoUnita, euroCentesimi } from '../../utils/resoconti';
import { Riquadro } from '../Riquadro';
import { PannelloCostiAnno } from './PannelloCostiAnno';
import { PannelloParametriStima } from './PannelloParametriStima';
import { testoNumero } from '../../utils/numeri';

const numero = (n: number) => testoNumero(n);

/** I parametri generali in parole: "28,50 €/h", "non impostato" */
const VOCI_GENERALI: { chiave: keyof RegoleStima; etichetta: string; testo: (n: number) => string }[] = [
  { chiave: 'costoOrarioConducente', etichetta: 'Costo orario del conducente', testo: n => `${euroCentesimi(n)}/h` },
  { chiave: 'velocitaMedia', etichetta: 'Velocità media', testo: n => `${numero(n)} km/h` },
  { chiave: 'oreGuidaGiorno', etichetta: 'Ore di guida al giorno', testo: n => `${numero(n)} h` },
  { chiave: 'diaria', etichetta: 'Diaria per notte fuori sede', testo: n => euroCentesimi(n) },
  { chiave: 'indennitaTrasferta', etichetta: 'Indennità di trasferta per giorno', testo: n => euroCentesimi(n) },
  { chiave: 'sogliaOreTrasferta', etichetta: 'Trasferta: soglia di durata', testo: n => `oltre ${numero(n)} ore di servizio` },
  { chiave: 'sogliaKmTrasferta', etichetta: 'Trasferta: soglia di distanza', testo: n => `oltre ${numero(n)} km di andata` },
  { chiave: 'pedaggioKm', etichetta: 'Pedaggio per km autostradale', testo: n => `${euroCentesimi(n)}/km` },
  { chiave: 'oreImpiegoAnnue', etichetta: 'Ore di impiego annue di un mezzo', testo: n => `${numero(n)} h` },
];

export const ParametriStima: React.FC = () => {
  const p = useParametriStima();
  const [generali, setGenerali] = useState(false);
  const [anno, setAnno] = useState<{ di: CostiAnno | null; aperto: boolean }>({ di: null, aperto: false });
  const [daEliminare, setDaEliminare] = useState<CostiAnno | null>(null);

  if (p.errore && !p.dati)
    return (
      <Alert variant='danger' title='Parametri non letti'>
        {p.errore}
      </Alert>
    );
  if (!p.dati) return <Skeleton className='h-64 w-full' />;
  const d = p.dati;

  const colonne: TableColumn<CostiAnno>[] = [
    {
      header: 'Anno',
      accessor: a => (
        <span>
          <span className='font-semibold'>{a.anno}</span>
          {a.anno === d.annoDiRiferimento && <span className='ml-2 text-xs text-action-primary'>usato per le stime</span>}
        </span>
      ),
    },
    { header: 'Cifre', accessor: a => (a.stato === 'consuntivo' ? 'Consuntivo' : 'Preventivo') },
    { header: 'Costi aziendali', accessor: a => <span className='tabular-nums'>{euroCentesimi(a.totale)}</span>, align: 'right' },
    {
      header: 'Ai mezzi',
      accessor: a => (
        <span className='tabular-nums'>
          {euroCentesimi(a.attribuiti)}
          <span className='block text-xs text-text-secondary'>{testoNumero(a.quotaMezzi)}%</span>
        </span>
      ),
      align: 'right',
    },
    { header: 'Ore di servizio', accessor: a => <span className='tabular-nums'>{a.oreServizio == null ? '—' : numero(a.oreServizio)}</span>, align: 'right' },
    {
      header: 'Per ora di servizio',
      accessor: a => <span className='font-semibold tabular-nums text-action-primary'>{a.costoPerOra == null ? '—' : `${euroCentesimi(a.costoPerOra)}/h`}</span>,
      align: 'right',
    },
    { header: 'Km annui', accessor: a => <span className='tabular-nums'>{a.kmAnnui == null ? '—' : numero(a.kmAnnui)}</span>, align: 'right', className: 'hidden lg:table-cell' },
    { header: 'Per km', accessor: a => <span className='tabular-nums'>{a.costoPerKm == null ? '—' : costoUnita(a.costoPerKm, 'km')}</span>, align: 'right' },
    { header: 'Ricavi', accessor: a => <span className='tabular-nums'>{a.ricavi == null ? '—' : euroCentesimi(a.ricavi)}</span>, align: 'right', className: 'hidden lg:table-cell' },
    {
      header: 'Aggiornato',
      accessor: a => <span className='text-text-secondary'>{[giornoBreve(aGiorno(new Date(a.aggiornatoIl))), a.aggiornatoDa && `da ${a.aggiornatoDa}`].filter(Boolean).join(' · ')}</span>,
      className: 'hidden md:table-cell',
    },
  ];

  return (
    <div className='space-y-6'>
      <Riquadro
        titolo='Parametri generali'
        azioni={
          d.modificabili && (
            <Button variant='outline' size='sm' onClick={() => setGenerali(true)}>
              Modifica
            </Button>
          )
        }
      >
        <dl className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {VOCI_GENERALI.map(v => {
            const valore = d.generali[v.chiave];
            return (
              <div key={v.chiave}>
                <dt className='text-xs text-text-secondary'>{v.etichetta}</dt>
                <dd className={valore == null ? 'text-sm text-text-secondary' : 'font-semibold tabular-nums'}>{valore == null ? 'non impostato' : v.testo(valore)}</dd>
              </div>
            );
          })}
        </dl>
      </Riquadro>

      <Riquadro
        titolo='Costi aziendali per anno'
        accanto='senza i conducenti'
        azioni={
          d.modificabili && (
            <Button variant='outline' size='sm' leftIcon={<Plus className='h-4 w-4' />} onClick={() => setAnno({ di: null, aperto: true })}>
              Aggiungi anno
            </Button>
          )
        }
      >
        <p className='mb-3 text-sm text-text-secondary'>
          Personale indiretto, struttura, servizi, consulenze e oneri, a consuntivo per gli anni chiusi e a preventivo per l’anno in corso. La quota che spetta ai servizi con i mezzi
          (trasporti e lavori), divisa per le loro ore di servizio, dà il costo aziendale per ora che la stima carica su ogni servizio; con i km annui anche quello per km, mostrato accanto.
        </p>
        <Table
          data={d.anni}
          columns={colonne}
          keyExtractor={a => a.uuid}
          emptyMessage='Nessun anno inserito: aggiungi i costi dell’anno in corso (a preventivo) o di un anno chiuso.'
          onRowClick={d.modificabili ? a => setAnno({ di: a, aperto: true }) : undefined}
          rowActions={
            d.modificabili
              ? {
                  enabled: true,
                  quickActions: {
                    edit: { enabled: true, onEdit: a => setAnno({ di: a, aperto: true }) },
                    delete: { enabled: true, onDelete: a => setDaEliminare(a), requireConfirmation: false },
                  },
                }
              : undefined
          }
        />
      </Riquadro>

      <PannelloParametriStima parametri={d} aperto={generali} inCorso={p.inCorso} onChiudi={() => setGenerali(false)} onSalva={p.cambiaGenerali} />
      <PannelloCostiAnno parametri={d} anno={anno.di} aperto={anno.aperto} inCorso={p.inCorso} onChiudi={() => setAnno(x => ({ ...x, aperto: false }))} onSalva={p.salvaAnno} />
      <ConfirmModal
        isOpen={!!daEliminare}
        onClose={() => setDaEliminare(null)}
        onConfirm={async () => {
          if (daEliminare && (await p.eliminaAnno(daEliminare.anno))) setDaEliminare(null);
        }}
        title={`Eliminare i costi aziendali ${daEliminare?.anno ?? ''}?`}
        message='Le stime già salvate restano come sono: conservano i valori usati.'
        confirmText='Elimina'
        variant='danger'
        isLoading={p.inCorso}
      />
    </div>
  );
};
