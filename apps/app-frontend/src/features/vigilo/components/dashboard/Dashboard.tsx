// src/features/vigilo/components/dashboard/Dashboard.tsx
//
// La dashboard di Vigilo (home del modulo dopo l'avvio). Due viste:
//   Da fare          "che cosa devo fare, e entro quando?"
//   Spese e consumi  "quanto spendo, quanto consumo?" (da sviluppare)
// In testa il titolo (PageHeader come le altre pagine) con il saluto e la
// sintesi come sottotitolo; sotto, la barra con vista e ricerca. Poi i riquadri
// numerici e due colonne indipendenti, così l'altezza variabile dell'elenco
// non lascia spazi vuoti: a sinistra Da fare e, sotto, i prossimi 12 mesi
// accanto a fatte in tempo; a destra per controllo e soggetti. Un clic su
// una scheda apre il pannello laterale della scadenza, con le azioni.
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@edg/auth';
import { Alert, PageHeader } from '@edg/ui';

import { leggiSedi } from '../../api/soggetti';
import type { VistaDashboard } from '../../types/dashboard';
import type { ProfiloVigilo } from '../../types/io';
import type { RiferimentoSoggetto } from '../../types/scadenze';
import { PannelloScadenza } from '../scadenza/PannelloScadenza';
import { BarraVista } from './BarraVista';
import { DaFare } from './DaFare';
import { FatteInTempo } from './FatteInTempo';
import { PerControllo } from './PerControllo';
import { ProssimiMesi } from './ProssimiMesi';
import { RiquadriStato } from './RiquadriStato';
import { Saluto } from './Saluto';
import { Soggetti } from './Soggetti';
import { useDashboard } from '../../hooks/useDashboard';
import { VistaSpese } from './VistaSpese';

/** Il nome per il saluto: la persona collegata in Vigilo, altrimenti dall'account */
const nomeDi = (profilo: ProfiloVigilo, daAccount: string) => {
  const nome = profilo.persona?.nome ?? (daAccount === 'Utente' ? '' : daAccount);
  return nome.split(' ')[0] || null;
};

export const Dashboard: React.FC<{ profilo: ProfiloVigilo }> = ({ profilo }) => {
  const { getDisplayName } = useAuth();
  const d = useDashboard();
  const [vista, setVista] = useState<VistaDashboard>('fare');
  const [sedi, setSedi] = useState<RiferimentoSoggetto[]>([]);
  // la scadenza nel pannello resta impostata alla chiusura, per l'animazione
  const [aperta, setAperta] = useState<string | null>(null);
  const [pannello, setPannello] = useState(false);
  const apri = useCallback((uuid: string) => {
    setAperta(uuid);
    setPannello(true);
  }, []);

  useEffect(() => {
    leggiSedi()
      .then(setSedi)
      .catch(() => setSedi([]));
  }, []);

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Dashboard'
        subtitle={
          <Saluto nome={nomeDi(profilo, getDisplayName())} oggi={d.dati?.oggi ?? null} conteggi={d.dati?.conteggi ?? null} />
        }
        onRefresh={d.ricarica}
        isLoading={d.caricamento}
      />

      <BarraVista vista={vista} onVista={setVista} testo={d.testo} onTesto={d.setTesto} />

      {d.errore && (
        <Alert variant='danger' title='Impossibile leggere le scadenze'>
          {d.errore}
        </Alert>
      )}

      {vista === 'spese' ? (
        <VistaSpese />
      ) : (
        <>
          <RiquadriStato conteggi={d.dati?.conteggi ?? null} vista={d.vista} onScegli={d.scegliVista} />
          <div className='flex flex-wrap items-start gap-4'>
            <div className='flex min-w-0 flex-[3_1_40rem] flex-col gap-4'>
              <DaFare d={d} sedi={sedi} onApri={apri} />
              {d.dati && (
                <div className='grid gap-4 md:grid-cols-2'>
                  <ProssimiMesi perMese={d.dati.perMese} />
                  <FatteInTempo mesi={d.dati.fatteInTempo} />
                </div>
              )}
            </div>
            {d.dati && (
              <aside className='flex min-w-0 flex-[1_1_20rem] flex-col gap-4'>
                <PerControllo righe={d.dati.perControllo} />
                <Soggetti soggetti={d.dati.soggetti} />
              </aside>
            )}
          </div>
        </>
      )}

      <PannelloScadenza
        uuid={aperta}
        aperto={pannello}
        capacita={profilo.capacita}
        onChiudi={() => setPannello(false)}
        onFatto={d.ricarica}
      />
    </div>
  );
};
