// src/features/vigilo/pages/NuovoSoggettoPage.tsx
//
// Nuovo soggetto (B7d-3) in tre passi: tipo e categoria, dati, date delle
// scadenze create. Il tipo può arrivare dall'elenco (?tipo=veicolo). Dopo la
// creazione non si torna indietro: si completa e si apre la scheda.
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Button, PageHeader, Skeleton, Stepper, type StepperStep } from '@edg/ui';

import { FormSoggetto } from '../components/soggetto/FormSoggetto';
import { PassoScadenze } from '../components/nuovo-soggetto/PassoScadenze';
import { PassoTipo } from '../components/nuovo-soggetto/PassoTipo';
import { TornaAllElenco } from '../components/TornaAllElenco';
import { TIPI } from '../constants/tipiSoggetto';
import { useInCima } from '../hooks/useInCima';
import { PASSI_NUOVO, useNuovoSoggetto } from '../hooks/useNuovoSoggetto';
import { useProfiloVigilo } from '../hooks/useProfiloVigilo';
import { useRiferimenti } from '../hooks/useRiferimenti';
import { TIPI_SOGGETTO, type TipoSoggetto } from '../types/valori';
import { campiDi, mancanti } from '../utils/formSoggetto';

const STEPS: StepperStep[] = [
  { id: 'tipo', label: 'Tipo e categoria', description: 'Che cosa aggiungi' },
  { id: 'dati', label: 'Dati', description: 'Nome, targa, dati utili' },
  { id: 'scadenze', label: 'Scadenze', description: 'Le date che conosci' },
];

const tipoDa = (v: string | null): TipoSoggetto | null => (TIPI_SOGGETTO.includes(v as TipoSoggetto) ? (v as TipoSoggetto) : null);

const NuovoSoggettoPage: React.FC = () => {
  const [parametri] = useSearchParams();
  const navigate = useNavigate();
  const { profilo, caricamento } = useProfiloVigilo();
  const tipoIniziale = tipoDa(parametri.get('tipo'));
  const riferimenti = useRiferimenti();
  const n = useNuovoSoggetto(tipoIniziale, riferimenti);
  useInCima(n.passo);

  const indice = PASSI_NUOVO.indexOf(n.passo);
  const daCompilare = mancanti(n.valori, campiDi(riferimenti.tutteLeCategorie, n.valori.categoria));

  const fine = async () => {
    if (n.creato && (await n.salvaDate())) navigate(`/vigilo/soggetti/${n.creato.uuid}`);
  };

  const titolo = n.tipo ? `Nuovo ${TIPI[n.tipo].singolare}` : 'Nuovo soggetto';

  if (caricamento) return <Skeleton className='h-64 w-full' />;
  if (!profilo?.capacita.write) {
    return (
      <div className='space-y-6'>
        <PageHeader title='Nuovo soggetto' />
        <Alert variant='warning' title='Permesso mancante'>
          Per aggiungere soggetti serve il permesso di scrittura in Vigilo.
        </Alert>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={titolo}
        subtitle='Vigilo crea da solo le scadenze dei controlli della categoria: alla fine inserisci le date che conosci.'
        trailingActions={<TornaAllElenco tipo={n.tipo} />}
      />
      <Stepper steps={STEPS} current={indice} onStepClick={n.creato ? undefined : i => i < indice && n.setPasso(PASSI_NUOVO[i])} />

      {n.passo === 'tipo' && (
        <PassoTipo
          tipo={n.tipo}
          onTipo={n.setTipo}
          categorie={riferimenti.categorieDel(n.tipo)}
          categoria={n.valori.categoria}
          categoriaScelta={n.categoriaScelta}
          onCategoria={n.setCategoria}
        />
      )}
      {n.passo === 'dati' && n.tipo && <FormSoggetto tipo={n.tipo} valori={n.valori} onValori={n.setValori} riferimenti={riferimenti} />}
      {n.passo === 'scadenze' && <PassoScadenze scadenze={n.scadenze} completamenti={n.completamenti} onCompleta={n.completa} />}

      <footer className='sticky bottom-[var(--edg-footer-h,0px)] z-30 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-border-default bg-bg-base/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6'>
        <div className='flex items-center gap-3'>
          {n.passo === 'tipo' && n.tipo && !n.categoriaScelta && <span className='text-sm text-text-secondary'>Manca: categoria</span>}
          {n.passo === 'dati' && (
            <Button variant='secondary' onClick={() => n.setPasso('tipo')} disabled={n.inCorso}>
              Indietro
            </Button>
          )}
          {n.passo === 'dati' && daCompilare.length > 0 && <span className='text-sm text-text-secondary'>Manca: {daCompilare.join(', ')}</span>}
        </div>
        {n.passo === 'tipo' && (
          <Button onClick={() => n.setPasso('dati')} disabled={!n.tipo || !n.categoriaScelta}>
            Avanti
          </Button>
        )}
        {n.passo === 'dati' && (
          <Button onClick={() => void n.crea()} disabled={daCompilare.length > 0} isLoading={n.inCorso} loadingText='Creo…'>
            Crea
          </Button>
        )}
        {n.passo === 'scadenze' && (
          <Button onClick={() => void fine()} isLoading={n.inCorso} loadingText='Salvo le date…'>
            Salva e apri la scheda
          </Button>
        )}
      </footer>
    </div>
  );
};

export default NuovoSoggettoPage;
