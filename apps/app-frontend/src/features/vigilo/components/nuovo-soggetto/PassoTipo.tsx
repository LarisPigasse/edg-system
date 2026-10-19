// src/features/vigilo/components/nuovo-soggetto/PassoTipo.tsx
//
// Primo passo: che cosa si aggiunge (tipo) e in quale categoria. La
// categoria decide i controlli automatici, cioè le scadenze che Vigilo crea
// da solo; senza categoria non ne crea.
import React from 'react';
import { Link } from 'react-router-dom';

import { TIPI } from '../../constants/tipiSoggetto';
import type { Categoria } from '../../types/configurazione';
import { TIPI_SOGGETTO, type TipoSoggetto } from '../../types/valori';
import { maiuscola } from '../../utils/testo';
import { Riquadro } from '../Riquadro';
import { Scelta } from './Scelta';

const controlli = (n?: number) => (n === undefined ? undefined : n === 0 ? 'Nessun controllo automatico' : n === 1 ? '1 controllo' : `${n} controlli`);

interface Props {
  tipo: TipoSoggetto | null;
  onTipo: (t: TipoSoggetto) => void;
  categorie: Categoria[];
  categoria: string | null;
  /** false finché l'utente non sceglie (nemmeno "Nessuna categoria" è predefinita) */
  categoriaScelta: boolean;
  onCategoria: (c: string | null) => void;
}

export const PassoTipo: React.FC<Props> = ({ tipo, onTipo, categorie, categoria, categoriaScelta, onCategoria }) => (
  <div className='space-y-6'>
    <Riquadro titolo='Che cosa aggiungi?'>
      <div className='grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3'>
        {TIPI_SOGGETTO.map(t => (
          <Scelta key={t} titolo={maiuscola(TIPI[t].singolare)} icona={TIPI[t].icona} scelto={tipo === t} onScegli={() => onTipo(t)} />
        ))}
      </div>
    </Riquadro>

    {tipo && (
      <Riquadro titolo='Categoria'>
        <p className='-mt-2 mb-4 text-sm text-text-secondary'>
          La categoria decide i controlli che Vigilo segue da solo: le loro scadenze nascono insieme {TIPI[tipo].femminile ? 'alla' : 'al'} {TIPI[tipo].singolare}.
        </p>
        <div className='grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-3'>
          {categorie.map(c => (
            <Scelta
              key={c.uuid}
              titolo={c.nome}
              dettaglio={[controlli(c.controlli), c.descrizione].filter(Boolean).join(' · ')}
              scelto={categoriaScelta && categoria === c.uuid}
              onScegli={() => onCategoria(c.uuid)}
            />
          ))}
          <Scelta titolo='Nessuna categoria' dettaglio='Nessun controllo automatico: le scadenze le aggiungi tu.' scelto={categoriaScelta && categoria === null} onScegli={() => onCategoria(null)} />
        </div>
        {categorie.length === 0 && (
          <p className='mt-4 text-sm text-text-secondary'>
            Non ci sono categorie per questo tipo.{' '}
            <Link to='/vigilo/configurazione' className='text-text-link hover:underline'>
              Configurazione
            </Link>
          </p>
        )}
      </Riquadro>
    )}
  </div>
);
