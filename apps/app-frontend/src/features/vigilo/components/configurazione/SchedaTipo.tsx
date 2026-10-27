// src/features/vigilo/components/configurazione/SchedaTipo.tsx
//
// Un tipo di soggetto nella Configurazione: le sue categorie (con quanti
// soggetti e controlli) e i suoi controlli in parole, con a chi vanno gli
// avvisi. Del controllo si cambiano per ora solo i destinatari, dal menu
// Azioni della riga (B8d-3); il resto è in sola lettura.
import React from 'react';
import { ActionMenu, Badge, Bell, LayoutGrid, MoreVertical, cn } from '@edg/ui';

import { DescrizioneControllo } from '../DescrizioneControllo';
import { IconaLibreria } from '../IconaLibreria';
import { TIPI } from '../../constants/tipiSoggetto';
import type { Categoria, Controllo } from '../../types/configurazione';
import type { GruppoConfigurazione } from '../../hooks/useConfigurazione';
import { fraseDestinatari } from '../../utils/destinatari';

const quanti = (n: number | undefined, uno: string, molti: string) => (n ? `${n} ${n === 1 ? uno : molti}` : null);

const SchedaCategoria: React.FC<{ c: Categoria }> = ({ c }) => (
  <article
    className={cn(
      'flex items-start gap-3 rounded-lg border border-border-default bg-bg-primary p-4',
      !c.attiva && 'opacity-60'
    )}
  >
    <span className='rounded-lg bg-bg-secondary p-2 text-text-secondary'>
      <IconaLibreria nome={c.icona} riserva={LayoutGrid} className='h-5 w-5' />
    </span>
    <span className='min-w-0 flex-1 space-y-1'>
      <span className='flex flex-wrap items-center gap-2'>
        <span className='font-medium text-text-primary'>{c.nome}</span>
        {!c.attiva && <Badge variant='warning' text='disattivata' />}
        {c.contatori.map(k => (
          <Badge key={k} variant='info' text={k} />
        ))}
      </span>
      <span className='block text-xs text-text-secondary'>
        {[quanti(c.soggetti, 'soggetto', 'soggetti') ?? 'nessun soggetto', quanti(c.controlli, 'controllo', 'controlli')]
          .filter(Boolean)
          .join(' · ')}
      </span>
    </span>
  </article>
);

const RigaControllo: React.FC<{ c: Controllo; onDestinatari: (c: Controllo) => void }> = ({ c, onDestinatari }) => (
  <li className='flex items-start gap-3 px-4 py-3'>
    <div className='min-w-0 flex-1'>
      <DescrizioneControllo
        nome={c.nome}
        natura={c.natura}
        rinnovo={c.rinnovo}
        frasi={c.frasi}
        attenuato={!c.attivo}
        dettagli={[
          c.categorie.length ? c.categorie.map(k => k.nome).join(', ') : null,
          c.riferimentoNormativo,
          c.scadenzeAperte ? `${c.scadenzeAperte} ${c.scadenzeAperte === 1 ? 'scadenza aperta' : 'scadenze aperte'}` : null,
          `avvisi a ${fraseDestinatari(c.destinatari)}`,
        ]}
        segni={
          <>
            {c.automatico && <Badge variant='primary' text='automatico' />}
            {!c.attivo && <Badge variant='warning' text='disattivato' />}
            {!c.libreria && <Badge text='creato da te' />}
          </>
        }
      />
    </div>
    <ActionMenu
      align='end'
      actions={[{ id: 'destinatari', label: 'Destinatari degli avvisi', icon: <Bell className='h-4 w-4' />, onClick: () => onDestinatari(c) }]}
      trigger={
        <button
          type='button'
          aria-label={`Azioni per ${c.nome}`}
          title='Azioni'
          className='rounded-md p-1.5 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary'
        >
          <MoreVertical className='h-4 w-4' />
        </button>
      }
    />
  </li>
);

export const SchedaTipo: React.FC<{ gruppo: GruppoConfigurazione; onDestinatari: (c: Controllo) => void }> = ({ gruppo, onDestinatari }) => (
  <div className='space-y-6 pt-4'>
    {gruppo.categorie.length > 0 && (
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold uppercase tracking-wide text-text-secondary'>Categorie</h3>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
          {gruppo.categorie.map(c => (
            <SchedaCategoria key={c.uuid} c={c} />
          ))}
        </div>
      </section>
    )}
    <section className='space-y-3'>
      <h3 className='text-sm font-semibold uppercase tracking-wide text-text-secondary'>Controlli</h3>
      {gruppo.controlli.length ? (
        <ul className='divide-y divide-border-thin overflow-hidden rounded-lg border border-border-default bg-bg-primary'>
          {gruppo.controlli.map(c => (
            <RigaControllo key={c.uuid} c={c} onDestinatari={onDestinatari} />
          ))}
        </ul>
      ) : (
        <p className='rounded-lg border border-dashed border-border-default p-4 text-sm text-text-secondary'>
          Nessun controllo per {TIPI[gruppo.tipo].plurale.toLowerCase()}.
        </p>
      )}
    </section>
  </div>
);
