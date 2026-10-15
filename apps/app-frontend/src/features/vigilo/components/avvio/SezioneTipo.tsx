// src/features/vigilo/components/avvio/SezioneTipo.tsx
//
// Passo 2, un tipo di soggetto: le sue categorie (schede da spuntare) e i suoi
// controlli (righe con le frasi pronte). Le voci già presenti non si toccano;
// i controlli senza categorie disponibili dicono che cosa includere.
import React from 'react';
import { AlertCircle, Badge, Check, Checkbox, LayoutGrid, cn } from '@edg/ui';

import { IconaLibreria } from '../IconaLibreria';
import { DescrizioneControllo } from '../DescrizioneControllo';
import { TIPI } from '../../constants/tipiSoggetto';
import type { CategoriaProposta, ControlloProposto, GruppoTipo, Proposta } from '../../types/avvio';
import { motivoBlocco, selezionabili, type Selezione } from '../../utils/selezione';

interface Props {
  gruppo: GruppoTipo;
  proposta: Proposta;
  selezione: Selezione;
  onCategorie: (chiavi: string[], dentro: boolean) => void;
  onControlli: (chiavi: string[], dentro: boolean) => void;
}

const TuttiNessuno: React.FC<{ onTutti: () => void; onNessuno: () => void; femminile?: boolean }> = ({ onTutti, onNessuno, femminile }) => (
  <span className='flex items-center gap-1 text-sm'>
    <button type='button' onClick={onTutti} className='rounded px-1.5 py-0.5 text-text-link hover:bg-bg-hover'>
      {femminile ? 'Tutte' : 'Tutti'}
    </button>
    <span className='text-text-disabled'>·</span>
    <button type='button' onClick={onNessuno} className='rounded px-1.5 py-0.5 text-text-link hover:bg-bg-hover'>
      {femminile ? 'Nessuna' : 'Nessuno'}
    </button>
  </span>
);

const SchedaCategoria: React.FC<{ c: CategoriaProposta; scelta: boolean; onCommuta: () => void }> = ({ c, scelta, onCommuta }) => {
  const attiva = scelta || !!c.presente;
  return (
    <button
      type='button'
      aria-pressed={attiva}
      disabled={!!c.presente}
      onClick={onCommuta}
      title={c.presente ? 'Già presente' : (c.descrizione ?? undefined)}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary',
        attiva ? 'border-action-primary bg-bg-selected text-text-primary' : 'border-border-default bg-bg-primary text-text-secondary hover:border-border-strong',
        c.presente && 'cursor-default opacity-70'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded border',
          attiva ? 'border-action-primary bg-action-primary text-action-primary-text' : 'border-border-strong'
        )}
      >
        {attiva && <Check className='h-3 w-3' />}
      </span>
      <IconaLibreria nome={c.icona} riserva={LayoutGrid} className='h-4 w-4' />
      <span className='font-medium'>{c.nome}</span>
      {c.presente && <span className='text-xs text-text-secondary'>· già presente</span>}
    </button>
  );
};

const RigaControllo: React.FC<{
  c: ControlloProposto;
  nomiCategorie: Map<string, string>;
  scelto: boolean;
  blocco: string | null;
  onCommuta: (dentro: boolean) => void;
}> = ({ c, nomiCategorie, scelto, blocco, onCommuta }) => {
  const id = `controllo-${c.chiave}`;
  const categorie = c.categorie.map(k => nomiCategorie.get(k)).filter(Boolean).join(', ');
  return (
    <li className={cn('flex gap-3 px-4 py-3', (blocco || c.presente) && 'bg-bg-secondary')}>
      <Checkbox
        id={id}
        checked={scelto || !!c.presente}
        disabled={!!c.presente || !!blocco}
        onCheckedChange={v => onCommuta(v === true)}
        className='mt-0.5'
      />
      <label htmlFor={id} className={cn('min-w-0 flex-1', !c.presente && !blocco && 'cursor-pointer')}>
        <DescrizioneControllo
          nome={c.nome}
          natura={c.natura}
          rinnovo={c.rinnovo}
          frasi={c.frasi}
          dettagli={[categorie || null, c.riferimentoNormativo]}
          segni={c.presente && <Badge variant='success' text='già presente' />}
          nota={
            blocco &&
            !c.presente && (
              <span className='flex items-center gap-1 text-xs font-medium text-text-warning'>
                <AlertCircle className='h-3.5 w-3.5' aria-hidden />
                {blocco}
              </span>
            )
          }
        />
      </label>
    </li>
  );
};

export const SezioneTipo: React.FC<Props> = ({ gruppo, proposta, selezione, onCategorie, onControlli }) => {
  const libere = selezionabili(gruppo);
  const nomiCategorie = new Map(gruppo.categorie.map(c => [c.chiave, c.nome]));

  return (
    <div className='space-y-6 pt-4'>
      {gruppo.categorie.length > 0 ? (
        <section className='space-y-3'>
          <header className='flex items-center justify-between gap-4'>
            <h3 className='text-sm font-semibold uppercase tracking-wide text-text-secondary'>Categorie</h3>
            {libere.categorie.length > 0 && (
              <TuttiNessuno femminile onTutti={() => onCategorie(libere.categorie, true)} onNessuno={() => onCategorie(libere.categorie, false)} />
            )}
          </header>
          <div className='flex flex-wrap gap-2'>
            {gruppo.categorie.map(c => (
              <SchedaCategoria
                key={c.chiave}
                c={c}
                scelta={selezione.categorie.has(c.chiave)}
                onCommuta={() => onCategorie([c.chiave], !selezione.categorie.has(c.chiave))}
              />
            ))}
          </div>
        </section>
      ) : (
        <p className='text-sm text-text-secondary'>
          Questi controlli valgono per {gruppo.tipo === 'azienda' ? "l'azienda" : `ogni ${TIPI[gruppo.tipo].singolare}`}, senza categorie.
        </p>
      )}

      <section className='space-y-3'>
        <header className='flex items-center justify-between gap-4'>
          <h3 className='text-sm font-semibold uppercase tracking-wide text-text-secondary'>Controlli</h3>
          {libere.controlli.length > 0 && (
            <TuttiNessuno onTutti={() => onControlli(libere.controlli, true)} onNessuno={() => onControlli(libere.controlli, false)} />
          )}
        </header>
        <ul className='divide-y divide-border-thin overflow-hidden rounded-lg border border-border-default bg-bg-primary'>
          {gruppo.controlli.map(c => (
            <RigaControllo
              key={c.chiave}
              c={c}
              nomiCategorie={nomiCategorie}
              scelto={selezione.controlli.has(c.chiave)}
              blocco={c.presente ? null : motivoBlocco(c, proposta, selezione)}
              onCommuta={dentro => onControlli([c.chiave], dentro)}
            />
          ))}
        </ul>
      </section>
    </div>
  );
};
