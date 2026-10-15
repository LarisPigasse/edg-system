// src/features/vigilo/components/soggetto/RiepilogoSoggetto.tsx
//
// Sotto il titolo, i riquadri per capire subito che cos'è e come sta il
// soggetto: tipo ("Veicolo") con identificativo e categoria, situazione
// delle scadenze, stato, sede, referente (quelli che ci sono), a tutta
// larghezza. Le azioni stanno nel menu "Azioni" in testa alla pagina.
import React from 'react';
import { Tooltip } from '@edg/ui';

import { STATI_SOGGETTO, etichettaStato } from '../../constants/statiSoggetto';
import { TIPI } from '../../constants/tipiSoggetto';
import type { Soggetto } from '../../types/soggetti';
import { giornoBreve } from '../../utils/giorni';
import { SituazioneSoggetto } from '../soggetti/SituazioneSoggetto';

const Voce: React.FC<{ etichetta: string; children: React.ReactNode }> = ({ etichetta, children }) => (
  <div className='min-w-0 rounded-lg border border-border-default bg-bg-primary px-4 py-3'>
    <p className='text-xs text-text-secondary'>{etichetta}</p>
    <div className='mt-1 truncate text-sm text-text-primary'>{children}</div>
  </div>
);

const maiuscola = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** "Targa FT456CD · Autocarri oltre 3,5 t e trattori stradali" */
const descrizione = (s: Soggetto) =>
  [s.identificativo && `${s.etichettaIdentificativo} ${s.identificativo}`, s.categoria?.nome].filter(Boolean).join(' · ') || '—';

export const RiepilogoSoggetto: React.FC<{ s: Soggetto }> = ({ s }) => (
  <div className='grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-3'>
    <Voce etichetta={maiuscola(TIPI[s.tipo].singolare)}>
      <span title={descrizione(s)}>{descrizione(s)}</span>
    </Voce>
    <Voce etichetta='Situazione'>
      <SituazioneSoggetto scadenze={s.scadenze} />
    </Voce>
    <Voce etichetta='Stato'>
      <Tooltip content={STATI_SOGGETTO[s.stato].info}>
        <span className={STATI_SOGGETTO[s.stato].testo}>
          {etichettaStato(s.stato, s.tipo)}
          {s.stato !== 'in-servizio' && s.statoDal ? ` dal ${giornoBreve(s.statoDal)}` : ''}
        </span>
      </Tooltip>
    </Voce>
    {s.sede && <Voce etichetta='Sede'>{s.sede.nome}</Voce>}
    {s.referente && <Voce etichetta='Referente'>{s.referente.nome}</Voce>}
  </div>
);
