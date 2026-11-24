// src/features/vigilo/components/analisi/FlottaAlLavoro.tsx
//
// La flotta al lavoro negli ultimi 12 mesi (2026-11-23, fase C): quattro
// cifre (disponibilità, consumo con la tendenza, km al mese, peso dei guasti)
// e la tabella dei veicoli, numeri a destra con l'intestazione (ADR112), in
// arancio ciò che supera le soglie del tenant (fase D): consumo sulla sua
// categoria (i veicoli si confrontano con quelli simili, non camion con auto),
// km al mese, disponibilità, peso dei guasti.
import React from 'react';
import { cn } from '@edg/ui';

import { COLORE_SOPRA_MEDIA } from '../../constants/costoMezzi';
import { COLORE_SALE, COLORE_SCENDE } from '../../constants/resoconti';
import type { Operativita, SoglieAnalisi } from '../../types/analisi';
import { euroTondi } from '../../utils/resoconti';
import { Scheda } from './Scheda';

const n = (x: number) => x.toLocaleString('it-IT', { useGrouping: 'always' } as unknown as Intl.NumberFormatOptions);
const segno = (x: number) => (x > 0 ? '+' : '');

const Cifra: React.FC<{ etichetta: string; cifra: string; sotto: React.ReactNode; colore?: string }> = ({ etichetta, cifra, sotto, colore }) => (
  <div className='min-w-0 rounded-lg bg-bg-secondary p-4'>
    <span className='block text-sm font-semibold text-text-primary'>{etichetta}</span>
    <span className={cn('block text-2xl font-bold tabular-nums', colore ?? 'text-text-primary')}>{cifra}</span>
    <span className='block text-xs text-text-secondary'>{sotto}</span>
  </div>
);

export const FlottaAlLavoro: React.FC<{ dati: Operativita; soglie: SoglieAnalisi }> = ({ dati: o, soglie }) => {
  const SCOSTAMENTO_CONSUMO = soglie.consumoAlto;
  const DISPONIBILITA_MINIMA = soglie.disponibilitaMinima;
  const t = o.consumo.tendenza;
  if (!o.veicoli)
    return (
      <Scheda titolo='La flotta al lavoro'>
        <p className='text-sm text-text-secondary'>Nessun veicolo con costi o letture negli ultimi 12 mesi.</p>
      </Scheda>
    );
  return (
    <Scheda titolo='La flotta al lavoro' sotto={`${o.veicoli} veicoli, ultimi 12 mesi.`}>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <Cifra
          etichetta='Disponibilità'
          cifra={o.disponibilita.percentuale === null ? '—' : `${o.disponibilita.percentuale.toLocaleString('it-IT')}%`}
          sotto={`${n(o.disponibilita.giorniFermo)} giorni di fermo per ${o.disponibilita.guasti} ${o.disponibilita.guasti === 1 ? 'guasto' : 'guasti'} bloccanti`}
          colore={o.disponibilita.percentuale !== null && o.disponibilita.percentuale < DISPONIBILITA_MINIMA ? COLORE_SOPRA_MEDIA : undefined}
        />
        <Cifra
          etichetta='Consumo'
          cifra={o.consumo.l100 === null ? '—' : `${o.consumo.l100.toLocaleString('it-IT')} l/100 km`}
          sotto={
            t === null ? (
              'tendenza: servono i due periodi'
            ) : (
              <>
                ultimi 3 mesi <span className={cn('font-semibold', t > 0 ? COLORE_SALE : t < 0 ? COLORE_SCENDE : '')}>{`${segno(t)}${t.toLocaleString('it-IT')}%`}</span> sui 9 prima
              </>
            )
          }
        />
        <Cifra
          etichetta='Utilizzo'
          cifra={o.utilizzo.kmMese === null ? '—' : `${n(o.utilizzo.kmMese)} km/mese`}
          sotto={o.utilizzo.sotto ? `${o.utilizzo.sotto} sotto i ${n(o.utilizzo.soglia)} km al mese` : 'nessun veicolo poco usato'}
        />
        <Cifra
          etichetta='Peso dei guasti'
          cifra={o.manutenzione.quotaGuasti === null ? '—' : `${o.manutenzione.quotaGuasti.toLocaleString('it-IT')}%`}
          sotto={`${euroTondi(o.manutenzione.riparazioni)} di riparazioni, ${euroTondi(o.manutenzione.programmata)} di manutenzione`}
          colore={o.manutenzione.quotaGuasti !== null && o.manutenzione.quotaGuasti > soglie.quotaGuastiMassima ? COLORE_SOPRA_MEDIA : undefined}
        />
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-border-default text-xs text-text-secondary'>
              <th className='py-1.5 pr-4 text-left font-medium'>Veicolo</th>
              <th className='py-1.5 pr-4 text-right font-medium'>Fermo</th>
              <th className='py-1.5 pr-4 text-right font-medium'>Disponibilità</th>
              <th className='py-1.5 pr-4 text-right font-medium'>Consumo</th>
              <th className='py-1.5 pr-4 text-right font-medium'>Sulla categoria</th>
              <th className='py-1.5 pr-4 text-right font-medium'>Km/mese</th>
              <th className='py-1.5 text-right font-medium'>Riparazioni</th>
            </tr>
          </thead>
          <tbody>
            {o.perVeicolo.map(v => (
              <tr key={v.uuid} className='border-b border-border-thin last:border-b-0'>
                <td className='py-1.5 pr-4'>
                  <span className='text-text-primary'>{v.nome}</span>
                  <span className='block text-xs text-text-secondary'>{[v.identificativo, v.categoria].filter(Boolean).join(' · ')}</span>
                </td>
                <td className='py-1.5 pr-4 text-right tabular-nums'>{v.giorniFermo ? `${v.giorniFermo} gg` : '—'}</td>
                <td className={cn('py-1.5 pr-4 text-right tabular-nums', v.disponibilita !== null && v.disponibilita < DISPONIBILITA_MINIMA && COLORE_SOPRA_MEDIA)}>
                  {v.disponibilita === null ? '—' : `${v.disponibilita.toLocaleString('it-IT')}%`}
                </td>
                <td className='py-1.5 pr-4 text-right tabular-nums'>{v.consumo === null ? '—' : `${v.consumo.toLocaleString('it-IT')} l`}</td>
                <td className={cn('py-1.5 pr-4 text-right tabular-nums', v.sullaCategoria !== null && v.sullaCategoria > SCOSTAMENTO_CONSUMO && COLORE_SOPRA_MEDIA)}>
                  {v.sullaCategoria === null ? '—' : `${segno(v.sullaCategoria)}${v.sullaCategoria.toLocaleString('it-IT')}%`}
                </td>
                <td className={cn('py-1.5 pr-4 text-right tabular-nums', v.kmMese !== null && v.kmMese < o.utilizzo.soglia && COLORE_SOPRA_MEDIA)}>
                  {v.kmMese === null ? '—' : n(v.kmMese)}
                </td>
                <td className='py-1.5 text-right tabular-nums'>{v.riparazioni ? euroTondi(v.riparazioni) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Scheda>
  );
};
