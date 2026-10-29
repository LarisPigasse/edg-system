// src/features/vigilo/pages/ScadenzePage.tsx
//
// L'elenco completo delle scadenze (B7e): ricerca e filtri, tabella con lo
// stato nel colore della dashboard, pannello laterale con le azioni, PDF di
// ciò che i filtri trovano. I filtri possono arrivare dall'indirizzo
// (?controllo=…&stato=…&natura=…): ci si arriva da "Per controllo" della dashboard;
// ?scadenza= apre il pannello (dalla campanella, ADR091).
import React, { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, ExportPdfAction, PageHeader } from '@edg/ui';

import { PannelloScadenza } from '../components/scadenza/PannelloScadenza';
import { FiltriElenco } from '../components/scadenze/FiltriElenco';
import { TabellaScadenze } from '../components/scadenze/TabellaScadenze';
import { FILTRI_STATO_SCADENZE } from '../constants/elencoScadenze';
import { useElencoScadenze, type FiltriElenco as Filtri } from '../hooks/useElencoScadenze';
import { useProfiloVigilo } from '../hooks/useProfiloVigilo';
import { useScadenzaDaIndirizzo } from '../hooks/useScadenzaDaIndirizzo';
import type { FiltroStatoScadenze } from '../types/scadenze';
import { NATURE_FILTRO, type NaturaEffettiva } from '../types/valori';

/** I filtri iniziali dall'indirizzo (solo valori riconosciuti) */
function dallIndirizzo(p: URLSearchParams): Partial<Filtri> {
  const stato = p.get('stato') as FiltroStatoScadenze | null;
  return {
    ...(stato && FILTRI_STATO_SCADENZE.some(f => f.value === stato) ? { stato } : {}),
    ...(p.get('controllo') ? { controllo: p.get('controllo')! } : {}),
    ...(NATURE_FILTRO.includes(p.get('natura') as NaturaEffettiva) ? { natura: p.get('natura') as NaturaEffettiva } : {}),
  };
}

const ScadenzePage: React.FC = () => {
  const [parametri] = useSearchParams();
  const { profilo } = useProfiloVigilo();
  const e = useElencoScadenze(dallIndirizzo(parametri));
  const [aperta, setAperta] = useState<string | null>(null);
  const [pannello, setPannello] = useState(false);
  const apri = useCallback((uuid: string) => {
    setAperta(uuid);
    setPannello(true);
  }, []);
  useScadenzaDaIndirizzo(apri);

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Scadenze'
        subtitle='Tutte le scadenze, aperte e chiuse, con i filtri per trovarle e le azioni a portata di clic.'
        onRefresh={() => void e.ricarica()}
        isLoading={e.caricamento}
        trailingActions={<ExportPdfAction onClick={() => void e.esportaPdf()} disabled={e.totale === 0} isLoading={e.esporto} loadingText='Preparo il PDF…' />}
      />
      <FiltriElenco e={e} />
      {e.errore && (
        <Alert variant='danger' title='Impossibile leggere le scadenze'>
          {e.errore}
        </Alert>
      )}
      <TabellaScadenze e={e} onApri={s => apri(s.uuid)} />
      {profilo && (
        <PannelloScadenza uuid={aperta} aperto={pannello} capacita={profilo.capacita} onChiudi={() => setPannello(false)} onFatto={() => void e.ricarica()} />
      )}
    </div>
  );
};

export default ScadenzePage;
