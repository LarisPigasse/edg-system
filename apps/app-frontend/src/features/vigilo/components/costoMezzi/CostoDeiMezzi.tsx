// src/features/vigilo/components/costoMezzi/CostoDeiMezzi.tsx
//
// In Spese e consumi, a tutta larghezza in fondo: il costo stimato dei mezzi
// del periodo, dal più caro. Possesso (quote e obblighi), manutenzione e
// guasti, rifornimenti e uso (con litri e consumo), totale, costo per km, ora
// o mese (con l'uso sotto); in fondo il confronto con gli altri mezzi della
// categoria, arancio se oltre la soglia. È una stima e non il
// "Totale speso": le quote di possesso non sono spese registrate. Un clic
// porta alla scheda del mezzo. I primi 16, poi "Mostra tutti". Da 1280 px
// la tabella, sotto le schede (due per riga dai 768).
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Skeleton, Table, cn, type TableColumn } from '@edg/ui';

import { COLORE_SOPRA_MEDIA, MEZZI_IN_VISTA } from '../../constants/costoMezzi';
import { TIPI } from '../../constants/tipiSoggetto';
import type { CostoMezzi, CostoMezzo } from '../../types/costoMezzi';
import { confrontoTesto, costoPerUnitaTesto, gruppoDi, guastiTesto, rifornimentiTesto } from '../../utils/costoMezzi';
import { euroBrevi, uso } from '../../utils/resoconti';
import { maiuscola } from '../../utils/testo';
import { Riquadro } from '../Riquadro';

const Vuoto: React.FC = () => <span className='text-text-secondary'>—</span>;

const VUOTO = 'Nessun mezzo con costi nel periodo: indica il costo di possesso nella scheda dei mezzi.';

function colonne(soglia: number): TableColumn<CostoMezzo>[] {
  return [
    {
      header: 'Mezzo',
      accessor: c => (
        <span className='flex min-w-0 items-center gap-2'>
          {React.createElement(TIPI[c.tipo].icona, { className: 'h-4 w-4 shrink-0 text-text-secondary', 'aria-label': maiuscola(TIPI[c.tipo].singolare) })}
          <span className='min-w-0 max-w-64'>
            <span className='block truncate font-medium text-text-primary'>{c.nome}</span>
            <span className='block truncate text-xs text-text-secondary' title={gruppoDi(c)}>
              {[c.identificativo, gruppoDi(c)].filter(Boolean).join(' · ')}
            </span>
          </span>
        </span>
      ),
    },
    {
      header: 'Possesso',
      accessor: c => (
        <span className='block tabular-nums'>
          {euroBrevi(c.possesso.totale)}
          {c.parziale && <span className='block text-xs text-text-secondary'>parziale</span>}
        </span>
      ),
      className: 'text-right',
    },
    {
      header: 'Manutenzione e guasti',
      accessor: c => (
        <span className='block tabular-nums'>
          {euroBrevi(c.manutenzione.totale)}
          <span className='block text-xs text-text-secondary'>{guastiTesto(c.manutenzione.guasti)}</span>
        </span>
      ),
      className: 'text-right',
    },
    {
      header: 'Rifornimenti e uso',
      accessor: c => (
        <span className='block tabular-nums'>
          {euroBrevi(c.rifornimenti.totale)}
          <span className='block text-xs text-text-secondary'>{rifornimentiTesto(c)}</span>
        </span>
      ),
      className: 'text-right',
    },
    { header: 'Totale', accessor: c => <span className='font-semibold tabular-nums'>{euroBrevi(c.totale)}</span>, className: 'text-right' },
    {
      header: 'Costo per km / ora / mese',
      accessor: c => {
        const t = costoPerUnitaTesto(c);
        return (
          <span className='block tabular-nums'>
            {t ? <span className={cn(c.confronto.segnalato && cn('font-semibold', COLORE_SOPRA_MEDIA))}>{t}</span> : <Vuoto />}
            {c.uso?.valore != null && <span className='block text-xs text-text-secondary'>{uso(c.uso.valore, c.uso.unita)}</span>}
          </span>
        );
      },
      className: 'text-right',
    },
    {
      header: 'Rispetto alla categoria',
      accessor: c => (
        <span className={cn('block max-w-72 whitespace-normal text-sm', c.confronto.segnalato ? cn('font-semibold', COLORE_SOPRA_MEDIA) : 'text-text-secondary')}>
          {confrontoTesto(c, soglia, false)}
        </span>
      ),
    },
  ];
}

/** Una riga dei blocchi nella scheda: nome, cifra allineata, nota */
const Blocco: React.FC<{ nome: string; cifra: string; nota: string | null }> = ({ nome, cifra, nota }) => (
  <>
    <span className='text-text-secondary'>{nome}</span>
    <span className='text-right tabular-nums text-text-primary'>{cifra}</span>
    <span className='min-w-0 text-xs text-text-secondary'>{nota}</span>
  </>
);

/** Un mezzo come scheda, sotto i 1280 px */
const SchedaMezzo: React.FC<{ c: CostoMezzo; soglia: number; onApri: () => void }> = ({ c, soglia, onApri }) => (
  <li>
    <button type='button' onClick={onApri} className='w-full space-y-2 rounded-lg border border-border-default bg-bg-primary p-4 text-left transition-colors hover:bg-bg-hover'>
      <span className='flex items-start justify-between gap-3'>
        <span className='min-w-0'>
          <span className='block truncate font-medium text-text-primary'>{c.nome}</span>
          <span className='block truncate text-xs text-text-secondary'>{[c.identificativo, gruppoDi(c)].filter(Boolean).join(' · ')}</span>
        </span>
        <span className='text-right'>
          <span className='block font-semibold tabular-nums text-text-primary'>{euroBrevi(c.totale)}</span>
          <span className={cn('block text-xs tabular-nums', c.confronto.segnalato ? cn('font-semibold', COLORE_SOPRA_MEDIA) : 'text-text-secondary')}>
            {costoPerUnitaTesto(c) ?? '—'}
          </span>
        </span>
      </span>
      <span className='grid grid-cols-[auto_auto_minmax(0,1fr)] items-baseline gap-x-3 gap-y-0.5 text-sm'>
        <Blocco nome='Possesso' cifra={euroBrevi(c.possesso.totale)} nota={c.parziale ? 'parziale' : null} />
        <Blocco nome='Manutenzione e guasti' cifra={euroBrevi(c.manutenzione.totale)} nota={guastiTesto(c.manutenzione.guasti)} />
        <Blocco nome='Rifornimenti e uso' cifra={euroBrevi(c.rifornimenti.totale)} nota={rifornimentiTesto(c, true)} />
      </span>
      <span className={cn('block text-sm', c.confronto.segnalato ? cn('font-semibold', COLORE_SOPRA_MEDIA) : 'text-text-secondary')}>{confrontoTesto(c, soglia, false)}</span>
    </button>
  </li>
);

export const CostoDeiMezzi: React.FC<{ dati: CostoMezzi | null; errore: string | null; caricamento: boolean }> = ({ dati, errore, caricamento }) => {
  const navigate = useNavigate();
  const [tutti, setTutti] = useState(false);
  const mezzi = dati?.mezzi ?? [];
  const righe = tutti ? mezzi : mezzi.slice(0, MEZZI_IN_VISTA);
  const segnalati = mezzi.filter(c => c.confronto.segnalato).length;
  const parziali = mezzi.filter(c => c.parziale).length;
  const soglia = dati?.sogliaScostamento ?? 32;
  return (
    <Riquadro titolo='Costo dei mezzi' accanto={dati ? `stima · ${mezzi.length} ${mezzi.length === 1 ? 'mezzo' : 'mezzi'}` : 'stima'}>
      <p className='-mt-2 mb-3 text-sm text-text-secondary'>
        Quote di possesso, obblighi, manutenzione, guasti, rifornimenti e uso: non è il «Totale speso», che conta solo le spese registrate.
        {segnalati > 0 && <span className={cn('font-semibold', COLORE_SOPRA_MEDIA)}> {segnalati === 1 ? 'Un mezzo costa' : `${segnalati} mezzi costano`} molto più degli altri della categoria.</span>}
      </p>
      {errore ? (
        <Alert variant='danger' title='Costo dei mezzi non disponibile'>
          {errore}
        </Alert>
      ) : caricamento && !dati ? (
        <Skeleton className='h-48 w-full' />
      ) : (
        <>
          <div className='hidden xl:block'>
            <Table
              data={righe}
              columns={colonne(soglia)}
              keyExtractor={c => c.uuid}
              emptyMessage={VUOTO}
              striped
              hoverable
              onRowClick={c => navigate(`/vigilo/soggetti/${c.uuid}`)}
            />
          </div>
          <div className='xl:hidden'>
            {righe.length ? (
              <ul className='grid gap-3 md:grid-cols-2'>
                {righe.map(c => (
                  <SchedaMezzo key={c.uuid} c={c} soglia={soglia} onApri={() => navigate(`/vigilo/soggetti/${c.uuid}`)} />
                ))}
              </ul>
            ) : (
              <p className='py-6 text-center text-sm text-text-secondary'>{VUOTO}</p>
            )}
          </div>
          {parziali > 0 && (
            <p className='mt-3 text-xs text-text-secondary'>
              {parziali === 1 ? 'Un mezzo non ha' : `${parziali} mezzi non hanno`} il costo di possesso: il loro costo è parziale e non entra nel confronto sul totale.
            </p>
          )}
          {mezzi.length > MEZZI_IN_VISTA && (
            <div className='mt-4 flex justify-center'>
              <Button variant='secondary' onClick={() => setTutti(!tutti)}>
                {tutti ? `Mostra i primi ${MEZZI_IN_VISTA}` : `Mostra tutti (${mezzi.length})`}
              </Button>
            </div>
          )}
        </>
      )}
    </Riquadro>
  );
};
