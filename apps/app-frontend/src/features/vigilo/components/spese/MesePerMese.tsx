// src/features/vigilo/components/spese/MesePerMese.tsx
//
// Le spese mese per mese: barre con fornitori esterni (pieno) e manodopera
// interna (chiaro) una sopra l'altra; un trattino giallo bordato di ambra
// scura è lo stesso mese dell'anno prima: si vede sul bianco e sul viola. Con più di un anno nel periodo, i mesi portano l'anno.
import React from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { Spese } from '../../types/resoconti';
import { euroTondi, meseCorto } from '../../utils/resoconti';
import { Riquadro } from '../Riquadro';

/** Il trattino dell'anno prima, largo come la barra: giallo con il bordo ambra scuro */
const Trattino: React.FC<{ cx?: number; cy?: number; value?: number | null }> = ({ cx, cy, value }) =>
  cx == null || cy == null || !value ? null : (
    <g>
      <line x1={cx - 13} x2={cx + 13} y1={cy} y2={cy} stroke='#b45309' strokeWidth={5} strokeLinecap='round' />
      <line x1={cx - 12} x2={cx + 12} y1={cy} y2={cy} stroke='#facc15' strokeWidth={3} strokeLinecap='round' />
    </g>
  );

const migliaia = (v: number) => (v >= 1000 ? `${(v / 1000).toLocaleString('it-IT', { maximumFractionDigits: 1 })}k` : String(v));

const Legenda: React.FC = () => (
  <div className='mt-3 flex flex-wrap gap-4 text-xs text-text-secondary'>
    <span className='inline-flex items-center gap-1.5'>
      <span className='h-2.5 w-2.5 rounded-sm bg-action-primary' /> Fornitori esterni
    </span>
    <span className='inline-flex items-center gap-1.5'>
      <span className='h-2.5 w-2.5 rounded-sm bg-action-primary opacity-40' /> Manodopera interna
    </span>
    <span className='inline-flex items-center gap-1.5'>
      <span className='h-1.5 w-4 rounded-full border border-amber-700 bg-yellow-400' /> Anno prima
    </span>
  </div>
);

export const MesePerMese: React.FC<{ dati: Spese }> = ({ dati }) => {
  const conAnno = dati.perMese.length > 12 || dati.periodo.dal.slice(0, 4) !== dati.periodo.al.slice(0, 4);
  const righe = dati.perMese.map(m => ({ ...m, etichetta: meseCorto(m.mese, conAnno) }));
  const vuoto = righe.every(m => !m.importi && !m.manodopera && !m.prima);
  return (
    <Riquadro titolo='Mese per mese' accanto={`${righe.length} ${righe.length === 1 ? 'mese' : 'mesi'}`}>
      {vuoto ? (
        <p className='flex min-h-36 items-center justify-center rounded-lg border border-dashed border-border-default p-4 text-center text-sm text-text-secondary'>
          Nessuna spesa registrata nel periodo.
        </p>
      ) : (
        <>
          <div className='h-56' role='img' aria-label={`Spese mese per mese: totale ${euroTondi(dati.totale.spesa)}`}>
            <ResponsiveContainer width='100%' height='100%'>
              <ComposedChart data={righe} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid vertical={false} stroke='var(--color-border-thin)' />
                <XAxis dataKey='etichetta' tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} interval='preserveStartEnd' />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} tickFormatter={migliaia} width={48} />
                <Tooltip
                  cursor={{ fill: 'var(--color-bg-hover)', opacity: 0.4 }}
                  formatter={(v, n) => [euroTondi(Number(v)), n === 'importi' ? 'Fornitori esterni' : n === 'manodopera' ? 'Manodopera interna' : 'Anno prima']}
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border-default)', fontSize: 12 }}
                />
                <Bar dataKey='importi' stackId='spesa' fill='var(--color-action-primary)' maxBarSize={32} />
                <Bar dataKey='manodopera' stackId='spesa' fill='var(--color-action-primary)' fillOpacity={0.4} radius={[2, 2, 0, 0]} maxBarSize={32} />
                <Line dataKey='prima' stroke='none' dot={<Trattino />} activeDot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <Legenda />
        </>
      )}
    </Riquadro>
  );
};
