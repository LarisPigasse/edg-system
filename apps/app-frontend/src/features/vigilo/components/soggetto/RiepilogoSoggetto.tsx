// src/features/vigilo/components/soggetto/RiepilogoSoggetto.tsx
//
// Sotto il titolo, i riquadri per capire subito che cos'è e come sta il
// soggetto: tipo ("Veicolo") con identificativo e categoria, situazione
// delle scadenze, stato, sede, referente e, per una persona, l'account
// collegato (B9b) e il costo orario a chi ha vigilo.costi (passo 8) (quelli
// che ci sono), su due colonne nella colonna sinistra della scheda. Il costo
// di possesso di un mezzo sta nella scheda dei costi (2026-11-16). Le azioni
// stanno nel menu "Azioni" sopra le schede.
import React from 'react';
import { Tooltip } from '@edg/ui';

import { STATI_SOGGETTO, etichettaStato } from '../../constants/statiSoggetto';
import { TIPI } from '../../constants/tipiSoggetto';
import type { Soggetto } from '../../types/soggetti';
import { giornoCon } from '../../utils/giorni';
import { euro } from '../../utils/manodopera';
import { maiuscola } from '../../utils/testo';
import { SituazioneSoggetto } from '../soggetti/SituazioneSoggetto';

const Voce: React.FC<{ etichetta: string; children: React.ReactNode }> = ({ etichetta, children }) => (
  <div className='min-w-0 rounded-lg border border-border-default bg-bg-primary px-4 py-3'>
    <p className='text-xs text-text-secondary'>{etichetta}</p>
    <div className='mt-1 truncate text-sm text-text-primary'>{children}</div>
  </div>
);

/** "Targa FT456CD · Autocarri oltre 3,5 t e trattori stradali" */
const descrizione = (s: Soggetto) =>
  [s.identificativo && `${s.etichettaIdentificativo} ${s.identificativo}`, s.categoria?.nome].filter(Boolean).join(' · ') || '—';

export const RiepilogoSoggetto: React.FC<{ s: Soggetto }> = ({ s }) => (
  <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
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
          {s.stato !== 'in-servizio' && s.statoDal ? ` ${giornoCon('da', s.statoDal.slice(0, 10))}` : ''}
        </span>
      </Tooltip>
    </Voce>
    {s.sede && <Voce etichetta='Sede'>{s.sede.nome}</Voce>}
    {s.referente && <Voce etichetta='Referente'>{s.referente.nome}</Voce>}
    {/* il servizio lo manda solo per le persone e a chi ha vigilo.costi */}
    {s.costoOrario !== undefined && (
      <Voce etichetta='Costo orario'>
        {s.costoOrario != null ? `${euro(s.costoOrario)}/h` : <span className='text-text-secondary'>non indicato: vale il predefinito</span>}
      </Voce>
    )}
    {s.account && (
      <Voce etichetta='Account'>
        <span title={s.account.email}>
          {s.account.nome} <span className='text-text-secondary'>· {s.account.email}</span>
        </span>
      </Voce>
    )}
  </div>
);
