// src/features/vigilo/components/analisi/Struttura.tsx
//
// I costi aziendali dell'anno contro l'anno prima, voce per voce (2026-11-23):
// colonne numeriche a destra con l'intestazione (ADR112); in arancio ciò che
// cresce, in verde ciò che cala.
import React from 'react';
import { cn } from '@edg/ui';

import { COLORE_SALE, COLORE_SCENDE } from '../../constants/resoconti';
import type { Analisi, VoceConfronto } from '../../types/analisi';
import { euroTondi } from '../../utils/resoconti';
import { Scheda } from './Scheda';

const segno = (n: number) => (n > 0 ? '+' : '');

const Cella: React.FC<{ v: VoceConfronto; forte?: boolean }> = ({ v, forte }) => (
  <tr className={cn('border-b border-border-thin last:border-b-0', forte && 'font-semibold')}>
    <td className='py-1.5 pr-4 text-text-primary'>{v.nome}</td>
    <td className='py-1.5 pr-4 text-right tabular-nums'>{euroTondi(v.prima)}</td>
    <td className='py-1.5 pr-4 text-right tabular-nums'>{euroTondi(v.dopo)}</td>
    <td className={cn('py-1.5 pr-4 text-right tabular-nums', v.differenza > 0 ? COLORE_SALE : v.differenza < 0 ? COLORE_SCENDE : 'text-text-secondary')}>
      {segno(v.differenza)}
      {euroTondi(v.differenza)}
    </td>
    <td className='py-1.5 text-right tabular-nums text-text-secondary'>{v.percentuale === null ? '—' : `${segno(v.percentuale)}${v.percentuale.toLocaleString('it-IT')}%`}</td>
  </tr>
);

export const Struttura: React.FC<{ dati: Analisi }> = ({ dati: a }) => {
  const titolo = 'Costi aziendali, anno contro anno';
  if (!a.struttura || !a.anno || !a.precedente)
    return (
      <Scheda titolo={titolo}>
        <p className='text-sm text-text-secondary'>
          {a.anno ? `Servono anche i costi del ${a.anno.anno - 1} per il confronto: Stima costi › Parametri.` : 'Servono i costi aziendali di due anni: Stima costi › Parametri.'}
        </p>
      </Scheda>
    );
  return (
    <Scheda titolo={titolo} sotto={`${a.anno.anno} (${a.anno.stato}) contro ${a.precedente.anno} (${a.precedente.stato}).`}>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-border-default text-xs text-text-secondary'>
              <th className='py-1.5 pr-4 text-left font-medium'>Voce</th>
              <th className='py-1.5 pr-4 text-right font-medium'>{a.precedente.anno}</th>
              <th className='py-1.5 pr-4 text-right font-medium'>{a.anno.anno}</th>
              <th className='py-1.5 pr-4 text-right font-medium'>Differenza</th>
              <th className='py-1.5 text-right font-medium'>%</th>
            </tr>
          </thead>
          <tbody>
            {a.struttura.voci.map(v => (
              <Cella key={v.voce} v={v} />
            ))}
            <Cella v={a.struttura.totale} forte />
          </tbody>
        </table>
      </div>
    </Scheda>
  );
};
