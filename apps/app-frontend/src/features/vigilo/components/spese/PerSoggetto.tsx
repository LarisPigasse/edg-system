// src/features/vigilo/components/spese/PerSoggetto.tsx
//
// La spesa per soggetto, dalla più alta: registrazioni (interventi e rifornimenti), spesa, variazione
// rispetto all'anno prima, uso nel periodo dal contatore e costo per km o per
// ora (solo sopra la soglia minima d'uso). Un clic porta alla scheda del
// soggetto. I primi 16, poi "Mostra tutti".
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Tooltip, cn, type TableColumn } from '@edg/ui';

import { SOGGETTI_IN_VISTA } from '../../constants/resoconti';
import { TIPI } from '../../constants/tipiSoggetto';
import type { SpesaSoggetto, Spese } from '../../types/resoconti';
import { coloreVariazione, costoUnita, euroTondi, uso, variazioneTesto } from '../../utils/resoconti';
import { maiuscola } from '../../utils/testo';
import { Riquadro } from '../Riquadro';

const Vuoto: React.FC = () => <span className='text-text-secondary'>—</span>;

function colonne(soglie: Spese['soglie']): TableColumn<SpesaSoggetto>[] {
  return [
    {
      header: 'Soggetto',
      accessor: s => (
        <span className='flex min-w-0 items-center gap-2'>
          {React.createElement(TIPI[s.tipo].icona, { className: 'h-4 w-4 shrink-0 text-text-secondary', 'aria-label': maiuscola(TIPI[s.tipo].singolare) })}
          <span className='min-w-0'>
            <span className='block truncate font-medium text-text-primary'>{s.nome}</span>
            {s.identificativo && <span className='block font-mono text-xs text-text-secondary'>{s.identificativo}</span>}
          </span>
        </span>
      ),
    },
    { header: 'Registrazioni', accessor: s => <span className='tabular-nums'>{s.n}</span>, className: 'text-right' },
    { header: 'Spesa', accessor: s => <span className='font-semibold tabular-nums'>{euroTondi(s.spesa)}</span>, className: 'text-right' },
    {
      header: 'Anno prima',
      accessor: s => (s.variazione === null ? <Vuoto /> : <span className={cn('font-semibold tabular-nums', coloreVariazione(s.variazione))}>{variazioneTesto(s.variazione)}</span>),
      className: 'text-right',
    },
    { header: 'Uso nel periodo', accessor: s => (s.uso?.valore != null ? <span className='tabular-nums'>{uso(s.uso.valore, s.uso.unita)}</span> : <Vuoto />), className: 'text-right' },
    {
      header: 'Costo per km / ora',
      accessor: s =>
        s.costoPerUnita != null && s.uso ? (
          <span className='tabular-nums'>{costoUnita(s.costoPerUnita, s.uso.unita)}</span>
        ) : s.uso ? (
          <Tooltip content={`Serve un uso di almeno ${soglie[s.uso.unita].toLocaleString('it-IT')} ${s.uso.unita === 'km' ? 'km' : 'ore'} nel periodo: sotto, il numero sarebbe fuorviante.`}>
            <span className='text-text-secondary'>uso troppo basso</span>
          </Tooltip>
        ) : (
          <Vuoto />
        ),
      className: 'text-right',
    },
  ];
}

export const PerSoggetto: React.FC<{ dati: Spese }> = ({ dati }) => {
  const navigate = useNavigate();
  const [tutti, setTutti] = useState(false);
  const righe = tutti ? dati.perSoggetto : dati.perSoggetto.slice(0, SOGGETTI_IN_VISTA);
  const n = dati.perSoggetto.length;
  return (
    <Riquadro titolo='Per soggetto' accanto={`${n} con spese`}>
      <Table
        data={righe}
        columns={colonne(dati.soglie)}
        keyExtractor={s => s.uuid}
        emptyMessage='Nessuna spesa con questi filtri.'
        striped
        hoverable
        onRowClick={s => navigate(`/vigilo/soggetti/${s.uuid}`)}
      />
      {n > SOGGETTI_IN_VISTA && (
        <div className='mt-4 flex justify-center'>
          <Button variant='secondary' onClick={() => setTutti(!tutti)}>
            {tutti ? `Mostra i primi ${SOGGETTI_IN_VISTA}` : `Mostra tutti (${n})`}
          </Button>
        </div>
      )}
      <p className='mt-3 text-xs text-text-secondary'>
        Costo per km o per ora = spesa del periodo ÷ uso dai contatori. Comprende solo le spese registrate in Vigilo (non il carburante).
      </p>
    </Riquadro>
  );
};
