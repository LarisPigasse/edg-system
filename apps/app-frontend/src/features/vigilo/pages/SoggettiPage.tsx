// src/features/vigilo/pages/SoggettiPage.tsx
//
// L'elenco dei soggetti (B7d-1): schede per tipo, ricerca e filtri, tabella
// con la situazione delle scadenze. Il tipo sta nell'indirizzo
// (?tipo=veicolo): ci si arriva dalla dashboard e il "indietro" lo ricorda.
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, PageHeader, Skeleton } from '@edg/ui';

import { FiltriSoggetti } from '../components/soggetti/FiltriSoggetti';
import { SchedeTipo } from '../components/soggetti/SchedeTipo';
import { TabellaSoggetti } from '../components/soggetti/TabellaSoggetti';
import { useProfiloVigilo } from '../hooks/useProfiloVigilo';
import { useSoggetti } from '../hooks/useSoggetti';
import { TIPI_SOGGETTO, type TipoSoggetto } from '../types/valori';

const tipoDa = (v: string | null): TipoSoggetto | null => (TIPI_SOGGETTO.includes(v as TipoSoggetto) ? (v as TipoSoggetto) : null);

const SoggettiPage: React.FC = () => {
  const [parametri, setParametri] = useSearchParams();
  const navigate = useNavigate();
  const { profilo } = useProfiloVigilo();
  const s = useSoggetti(tipoDa(parametri.get('tipo')));

  const scegliTipo = (t: TipoSoggetto | null) => {
    s.setTipo(t);
    setParametri(t ? { tipo: t } : {}, { replace: true });
  };

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Soggetti'
        subtitle='Veicoli, macchine, attrezzature, sedi e persone che Vigilo segue, con la situazione delle loro scadenze.'
        onRefresh={s.ricarica}
        isLoading={s.caricamento}
        trailingActions={
          profilo?.capacita.write ? (
            <Button onClick={() => navigate(`/vigilo/soggetti/nuovo${s.tipo ? `?tipo=${s.tipo}` : ''}`)}>Nuovo soggetto</Button>
          ) : undefined
        }
      />

      {s.conteggi === null ? <Skeleton className='h-10 w-full' /> : <SchedeTipo conteggi={s.conteggi} tipo={s.tipo} onTipo={scegliTipo} />}

      <FiltriSoggetti s={s} />

      {s.errore && (
        <Alert variant='danger' title='Impossibile leggere i soggetti'>
          {s.errore}
        </Alert>
      )}

      <TabellaSoggetti s={s} onApri={x => navigate(`/vigilo/soggetti/${x.uuid}`)} />
    </div>
  );
};

export default SoggettiPage;
