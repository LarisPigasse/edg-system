// src/features/vigilo/components/configurazione/SchedaTipo.tsx
//
// Un tipo di soggetto nella Configurazione: le sue categorie (con quanti
// soggetti e controlli) e i suoi controlli in parole, con a chi vanno gli
// avvisi. Dal menu Azioni della riga: i destinatari del controllo (B8d-3) e,
// con vigilo.config, Disattiva / Riattiva di controlli e categorie
// (2026-11-19); le voci disattivate si vedono solo se richiesto. Le voci con un
// aggiornamento della libreria hanno un segno che apre il dettaglio; lo
// Storico della libreria è nel menu del controllo (B10b) e in quello della
// categoria, che per ora ha solo questa voce (solo se viene dalla libreria).
import React from 'react';
import { ActionMenu, Badge, Bell, Button, Clock, Copy, LayoutGrid, MoreVertical, Pencil, Plus, Power, Trash2, cn, type Action } from '@edg/ui';

import { DescrizioneControllo } from '../DescrizioneControllo';
import { IconaLibreria } from '../IconaLibreria';
import { TIPI } from '../../constants/tipiSoggetto';
import type { EntitaAggiornamento, TipoProposta } from '../../types/aggiornamenti';
import type { Categoria, Controllo } from '../../types/configurazione';
import type { GruppoConfigurazione } from '../../hooks/useConfigurazione';
import type { VoceDaAttivare } from '../../hooks/useAttivazione';
import { fraseDestinatari } from '../../utils/destinatari';

const quanti = (n: number | undefined, uno: string, molti: string) => (n ? `${n} ${n === 1 ? uno : molti}` : null);

/** Apre lo Storico della libreria di una voce (categoria o controllo) */
export type ApriStorico = (entita: EntitaAggiornamento, voce: { uuid: string; nome: string }) => void;

const ICONA_STORICO = <Clock className='h-4 w-4' />;
const ICONA_ATTIVA = <Power className='h-4 w-4' />;

/** Elimina: per le voci senza storico, o ancora attive (allora porta a Disattiva, spiegando perché) */
const voceElimina = (eliminabile: boolean, attiva: boolean, onClick: () => void): Action[] =>
  eliminabile || attiva ? [{ id: 'elimina', label: 'Elimina', icon: <Trash2 className='h-4 w-4' />, variant: 'danger', onClick }] : [];

/** Disattiva / Riattiva, se si può cambiare la configurazione */
const voceAttiva = (attiva: boolean, onClick: () => void): Action => ({
  id: 'attiva',
  label: attiva ? 'Disattiva' : 'Riattiva',
  icon: ICONA_ATTIVA,
  variant: attiva ? 'danger' : undefined,
  onClick,
});

/** Il menu "⋮" delle azioni, uguale per categorie e controlli */
const MenuAzioni: React.FC<{ nome: string; azioni: Action[] }> = ({ nome, azioni }) => (
  <ActionMenu
    align='end'
    actions={azioni}
    trigger={
      <button
        type='button'
        aria-label={`Azioni per ${nome}`}
        title='Azioni'
        className='rounded-md p-1.5 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary'
      >
        <MoreVertical className='h-4 w-4' />
      </button>
    }
  />
);

/** Le voci con qualcosa da decidere sulla libreria (uuid → aggiornamento o ritiro) e come aprirle */
export interface InAttesa {
  voci: ReadonlyMap<string, TipoProposta>;
  onApri: (uuid: string) => void;
}

/** Il segno cliccabile di una voce con un aggiornamento (o ritirata) */
const SegnoAggiornamento: React.FC<{ tipo: TipoProposta; maschile: boolean; onApri: () => void }> = ({ tipo, maschile, onApri }) => (
  <button
    type='button'
    onClick={onApri}
    title={tipo === 'ritiro' ? 'Ritirata dalla libreria: decidi se tenerla' : 'Nuova versione nella libreria: apri per decidere'}
    className='rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary'
  >
    <Badge
      variant={tipo === 'ritiro' ? 'warning' : 'info'}
      text={tipo === 'ritiro' ? (maschile ? 'ritirato' : 'ritirata') : 'aggiornamento'}
      className='cursor-pointer rounded-lg'
    />
  </button>
);

const SchedaCategoria: React.FC<{
  c: Categoria;
  onStorico?: ApriStorico;
  onAttiva?: (v: VoceDaAttivare) => void;
  onModifica?: (c: Categoria) => void;
  onElimina?: (v: VoceDaAttivare) => void;
  attesa?: InAttesa;
}> = ({ c, onStorico, onAttiva, onModifica, onElimina, attesa }) => {
  const azioni: Action[] = [
    ...(onModifica ? [{ id: 'modifica', label: 'Modifica', icon: <Pencil className='h-4 w-4' />, onClick: () => onModifica(c) }] : []),
    ...(onAttiva ? [voceAttiva(c.attiva, () => onAttiva({ entita: 'categoria', voce: c }))] : []),
    ...(c.libreria && onStorico ? [{ id: 'storico', label: 'Storico della libreria', icon: ICONA_STORICO, onClick: () => onStorico('categoria', c) }] : []),
    ...(onElimina ? voceElimina(!!c.eliminabile, c.attiva, () => onElimina({ entita: 'categoria', voce: c })) : []),
  ];
  return (
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
        {c.personalizzata && <Badge variant='info' text='personalizzata' />}
        {attesa?.voci.has(c.uuid) && <SegnoAggiornamento tipo={attesa.voci.get(c.uuid)!} maschile={false} onApri={() => attesa.onApri(c.uuid)} />}
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
    {azioni.length > 0 && (
      <span className='-mr-1.5 -mt-1.5'>
        <MenuAzioni nome={c.nome} azioni={azioni} />
      </span>
    )}
  </article>
  );
};

interface PropsRiga {
  c: Controllo;
  onDestinatari: (c: Controllo) => void;
  onStorico?: ApriStorico;
  onAttiva?: (v: VoceDaAttivare) => void;
  onModifica?: (c: Controllo) => void;
  onDuplica?: (c: Controllo) => void;
  onElimina?: (v: VoceDaAttivare) => void;
  attesa?: InAttesa;
}

const RigaControllo: React.FC<PropsRiga> = ({ c, onDestinatari, onStorico, onAttiva, onModifica, onDuplica, onElimina, attesa }) => (
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
            {c.personalizzato && <Badge variant='info' text='personalizzato' />}
            {attesa?.voci.has(c.uuid) && <SegnoAggiornamento tipo={attesa.voci.get(c.uuid)!} maschile onApri={() => attesa.onApri(c.uuid)} />}
          </>
        }
      />
    </div>
    <MenuAzioni
      nome={c.nome}
      azioni={[
        ...(onModifica ? [{ id: 'modifica', label: 'Modifica', icon: <Pencil className='h-4 w-4' />, onClick: () => onModifica(c) }] : []),
        ...(onDuplica ? [{ id: 'duplica', label: 'Duplica', icon: <Copy className='h-4 w-4' />, onClick: () => onDuplica(c) }] : []),
        { id: 'destinatari', label: 'Destinatari degli avvisi', icon: <Bell className='h-4 w-4' />, onClick: () => onDestinatari(c) },
        ...(c.libreria && onStorico ? [{ id: 'storico', label: 'Storico della libreria', icon: ICONA_STORICO, onClick: () => onStorico('controllo', c) }] : []),
        ...(onAttiva ? [voceAttiva(c.attivo, () => onAttiva({ entita: 'controllo', voce: c }))] : []),
        ...(onElimina ? voceElimina(!!c.eliminabile, c.attivo, () => onElimina({ entita: 'controllo', voce: c })) : []),
      ]}
    />
  </li>
);

interface Props {
  gruppo: GruppoConfigurazione;
  onDestinatari: (c: Controllo) => void;
  onStorico?: ApriStorico;
  /** Disattiva / Riattiva (solo con vigilo.config) */
  onAttiva?: (v: VoceDaAttivare) => void;
  /** Modifica, duplica e nuovo controllo (solo con vigilo.config) */
  onModifica?: (c: Controllo) => void;
  onDuplica?: (c: Controllo) => void;
  onNuovo?: () => void;
  /** Modifica e nuova categoria (solo con vigilo.config) */
  onModificaCategoria?: (c: Categoria) => void;
  onNuovaCategoria?: () => void;
  /** Elimina, o Disattiva se ha uno storico (solo con vigilo.config) */
  onElimina?: (v: VoceDaAttivare) => void;
  /** Le voci disattivate si mostrano solo se richiesto */
  mostraDisattivati: boolean;
  attesa?: InAttesa;
}

export const SchedaTipo: React.FC<Props> = ({
  gruppo,
  onDestinatari,
  onStorico,
  onAttiva,
  onModifica,
  onDuplica,
  onNuovo,
  onModificaCategoria,
  onNuovaCategoria,
  onElimina,
  mostraDisattivati,
  attesa,
}) => {
  const categorie = mostraDisattivati ? gruppo.categorie : gruppo.categorie.filter(c => c.attiva);
  const controlli = mostraDisattivati ? gruppo.controlli : gruppo.controlli.filter(c => c.attivo);
  return (
  <div className='space-y-6 pt-4'>
    {(categorie.length > 0 || onNuovaCategoria) && (
      <section className='space-y-3'>
        {/* titolo e "Nuova categoria" sulla stessa riga */}
        <div className='flex items-center justify-between gap-2'>
          <h3 className='text-sm font-semibold uppercase tracking-wide text-text-secondary'>Categorie</h3>
          {onNuovaCategoria && (
            <Button variant='outline' size='sm' leftIcon={<Plus className='h-4 w-4' />} onClick={onNuovaCategoria}>
              Nuova categoria
            </Button>
          )}
        </div>
        {categorie.length === 0 && <p className='text-sm text-text-secondary'>Nessuna categoria: i controlli valgono per tutti i soggetti del tipo.</p>}
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'>
          {categorie.map(c => (
            <SchedaCategoria key={c.uuid} c={c} onStorico={onStorico} onAttiva={onAttiva} onModifica={onModificaCategoria} onElimina={onElimina} attesa={attesa} />
          ))}
        </div>
      </section>
    )}
    <section className='space-y-3'>
      {/* titolo e "Nuovo controllo" sulla stessa riga */}
      <div className='flex items-center justify-between gap-2'>
        <h3 className='text-sm font-semibold uppercase tracking-wide text-text-secondary'>Controlli</h3>
        {onNuovo && (
          <Button variant='outline' size='sm' leftIcon={<Plus className='h-4 w-4' />} onClick={onNuovo}>
            Nuovo controllo
          </Button>
        )}
      </div>
      {controlli.length ? (
        <ul className='divide-y divide-border-thin overflow-hidden rounded-lg border border-border-default bg-bg-primary'>
          {controlli.map(c => (
            <RigaControllo key={c.uuid} c={c} onDestinatari={onDestinatari} onStorico={onStorico} onAttiva={onAttiva} onModifica={onModifica} onDuplica={onDuplica} onElimina={onElimina} attesa={attesa} />
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
};
