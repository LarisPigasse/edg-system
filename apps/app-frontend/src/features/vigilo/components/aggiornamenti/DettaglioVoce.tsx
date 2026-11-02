// src/features/vigilo/components/aggiornamenti/DettaglioVoce.tsx
//
// Una voce della libreria da decidere (B10b): la novità scritta da EDG, poi
// campo per campo il tuo valore e quello della libreria con la scelta già
// proposta. Una voce ritirata si tiene o si disattiva (le scelte sono nel
// piede del pannello).
import React from 'react';
import { Archive, ChevronLeft } from '@edg/ui';

import { TIPI } from '../../constants/tipiSoggetto';
import type { Scelta, VoceAggiornamento } from '../../types/aggiornamenti';
import { SceltaCampo } from './SceltaCampo';

interface Props {
  v: VoceAggiornamento;
  scelte: Record<string, Scelta>;
  onScelta: (campo: string, s: Scelta) => void;
  /** Torna all'elenco (assente se la voce è l'unica) */
  onIndietro?: () => void;
  inCorso: boolean;
}

const versioni = (v: VoceAggiornamento) =>
  v.versioneDa && v.versioneDa !== v.versioneA ? `versione ${v.versioneDa} → ${v.versioneA}` : `versione ${v.versioneA}`;

export const DettaglioVoce: React.FC<Props> = ({ v, scelte, onScelta, onIndietro, inCorso }) => {
  const controllo = v.entita === 'controllo';
  return (
    <div className='space-y-6'>
      {onIndietro && (
        <button type='button' onClick={onIndietro} className='inline-flex items-center gap-1 text-sm font-semibold text-action-primary hover:underline'>
          <ChevronLeft className='h-4 w-4' aria-hidden />
          Tutti gli aggiornamenti
        </button>
      )}

      <header className='space-y-1'>
        <h3 className='text-lg font-semibold text-text-primary'>{v.nome}</h3>
        <p className='text-sm text-text-secondary'>
          {controllo ? 'Controllo' : 'Categoria'} · {TIPI[v.tipoSoggetto].plurale} · {versioni(v)}
        </p>
      </header>

      <section className='rounded-lg bg-bg-secondary p-4 text-sm'>
        <p className='font-medium text-text-primary'>{v.tipo === 'ritiro' ? `Perché è stat${controllo ? 'o ritirato' : 'a ritirata'}` : 'Che cosa cambia'}</p>
        <p className='mt-1 whitespace-pre-line text-text-secondary'>{v.novita || 'EDG non ha scritto note per questa versione.'}</p>
      </section>

      {v.tipo === 'ritiro' ? (
        <section className='flex gap-3 text-sm text-text-secondary'>
          <Archive className='mt-0.5 h-5 w-5 shrink-0 text-text-secondary' aria-hidden />
          <div className='space-y-2'>
            <p>EDG non segue più questa voce: non riceverà altri aggiornamenti. La tua copia resta com’è finché vuoi.</p>
            <p>
              {controllo
                ? 'Se lo disattivi, le sue scadenze aperte si chiudono e non se ne creano di nuove; lo storico resta.'
                : 'Se la disattivi, resta sui soggetti che la usano ma non si propone più per quelli nuovi.'}
            </p>
          </div>
        </section>
      ) : v.campi.length ? (
        <section className='space-y-5'>
          <p className='text-sm text-text-secondary'>
            Per ogni campo è già scelto il valore della libreria, tranne dove l’avevi personalizzato tu. Cambia le scelte se serve.
          </p>
          {v.campi.map(c => (
            <SceltaCampo key={c.campo} c={c} scelta={scelte[c.campo] ?? 'mio'} onScelta={s => onScelta(c.campo, s)} disabilitato={inCorso} />
          ))}
        </section>
      ) : (
        <p className='text-sm text-text-secondary'>La nuova versione non cambia niente dei tuoi valori: applicandola resti allineato alla libreria.</p>
      )}
    </div>
  );
};
