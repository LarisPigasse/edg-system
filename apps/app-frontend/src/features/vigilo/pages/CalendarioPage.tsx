// src/features/vigilo/pages/CalendarioPage.tsx
//
// Calendario (07-interfaccia 7.11, ADR083): le scadenze aperte giorno per
// giorno. In testa ricerca e filtri (come la dashboard); a sinistra le
// scadenze del giorno scelto (256 px, alte quanto il calendario, con lo
// scorrimento interno; sotto i 1024 px vanno sopra il calendario, alte quanto
// serve), a destra il mese (MonthCalendar di @edg/ui, etichette brevi o
// pallini); un clic apre il pannello della scadenza. Il mese sta
// nell'indirizzo (?mese=AAAA-MM).
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, MonthCalendar, PageHeader } from '@edg/ui';

import { leggiSedi } from '../api/soggetti';
import { CampoRicerca } from '../components/CampoRicerca';
import { CellaGiorno } from '../components/calendario/CellaGiorno';
import { ElencoGiorno } from '../components/calendario/ElencoGiorno';
import { FiltriDaFare } from '../components/dashboard/FiltriDaFare';
import { PannelloScadenza } from '../components/scadenza/PannelloScadenza';
import { useCalendario } from '../hooks/useCalendario';
import { useProfiloVigilo } from '../hooks/useProfiloVigilo';
import type { RiferimentoSoggetto } from '../types/scadenze';

const CalendarioPage: React.FC = () => {
  const c = useCalendario();
  const { profilo } = useProfiloVigilo();
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

  const arretrato = c.dati?.arretrato ?? 0;

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Calendario'
        subtitle='Le scadenze aperte giorno per giorno: un clic su un giorno mostra che cosa c’è da fare.'
        onRefresh={c.ricarica}
        isLoading={c.caricamento}
      />

      <div className='flex flex-wrap items-end justify-between gap-3'>
        <FiltriDaFare
          filtri={c.filtri}
          onFiltri={c.setFiltri}
          sedi={sedi}
          filtriAttivi={c.filtriAttivi}
          onAzzera={c.azzeraFiltri}
        />
        <CampoRicerca
          valore={c.testo}
          onCambia={c.setTesto}
          segnaposto='Cerca veicolo, persona, targa…'
          className='mb-5 w-72'
        />
      </div>

      {c.errore && (
        <Alert variant='danger' title='Impossibile leggere il calendario'>
          {c.errore}
        </Alert>
      )}
      {c.dati?.troncato && (
        <Alert variant='warning' title='Troppe scadenze in questo mese'>
          Ne sono mostrate 1024: usa i filtri per restringere.
        </Alert>
      )}

      <div className='grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]'>
        {/* il dettaglio non dà altezza alla riga (absolute): è il calendario a deciderla */}
        <aside className='min-w-0 lg:relative'>
          <div className='lg:absolute lg:inset-0'>
            <ElencoGiorno
              giorno={c.giorno}
              voci={c.perGiorno.get(c.giorno) ?? []}
              oggi={c.oggi}
              onApri={apri}
              className='lg:h-full lg:overflow-y-auto'
            />
          </div>
        </aside>
        <section className='min-w-0 rounded-lg border border-border-thin bg-bg-primary p-4 sm:p-5'>
          <MonthCalendar
            month={c.mese}
            onMonthChange={c.vaiAlMese}
            selected={c.giorno}
            onSelect={c.setGiorno}
            today={c.oggi}
            cellClassName='lg:min-h-24'
            dayLabel={day => {
              const n = c.perGiorno.get(day)?.length ?? 0;
              return n ? `${n} ${n === 1 ? 'scadenza' : 'scadenze'}` : undefined;
            }}
            renderDay={(day, info) => <CellaGiorno voci={c.perGiorno.get(day) ?? []} oggi={c.oggi} attenuato={!info.inMonth} />}
            actions={
              arretrato > 0 && (
                <Link
                  to='/vigilo/scadenze'
                  className='text-sm text-text-link hover:underline'
                  title='Apri l’elenco delle scadenze, per urgenza'
                >
                  Arretrato: {arretrato} {arretrato === 1 ? 'scadenza' : 'scadenze'} dai mesi scorsi
                </Link>
              )
            }
          />
        </section>
      </div>

      {profilo && (
        <PannelloScadenza
          uuid={aperta}
          aperto={pannello}
          capacita={profilo.capacita}
          onChiudi={() => setPannello(false)}
          onFatto={c.ricarica}
        />
      )}
    </div>
  );
};

export default CalendarioPage;
