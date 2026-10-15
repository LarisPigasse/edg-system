// src/features/vigilo/components/dashboard/FatteInTempo.tsx
//
// La quota di esecuzioni registrate entro la data, mese per mese (ultimi 12).
// Una sola serie: la linea nel colore principale, senza legenda; i mesi senza
// esecuzioni restano vuoti invece di valere zero.
import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Riquadro } from '../Riquadro';
import type { Dashboard } from '../../types/dashboard';

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

export const FatteInTempo: React.FC<{ mesi: Dashboard['fatteInTempo'] }> = ({ mesi }) => {
  const totale = mesi.reduce((a, m) => a + m.totale, 0);
  const inTempo = mesi.reduce((a, m) => a + m.inTempo, 0);
  const dati = mesi.map(m => ({
    mese: MESI[Number(m.mese.slice(5)) - 1],
    quota: m.totale ? Math.round((m.inTempo / m.totale) * 100) : null,
    dettaglio: `${m.inTempo} su ${m.totale}`,
  }));

  return (
    <Riquadro className='flex h-full flex-col' titolo='Fatte in tempo' accanto={totale ? `${Math.round((inTempo / totale) * 100)}% nell'ultimo anno` : undefined}>
      <p className='-mt-2 mb-3 text-sm text-text-secondary'>Le scadenze registrate entro la data, mese per mese.</p>
      {totale === 0 ? (
        <p className='flex min-h-36 flex-1 items-center justify-center rounded-lg border border-dashed border-border-default p-4 text-center text-sm text-text-secondary'>
          Il grafico compare con le prime registrazioni.
        </p>
      ) : (
        <div className='h-48' role='img' aria-label={`Fatte in tempo: ${inTempo} su ${totale} nell'ultimo anno`}>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={dati} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
              <CartesianGrid vertical={false} stroke='var(--color-border-thin)' />
              <XAxis dataKey='mese' tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} interval={1} />
              <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} unit='%' />
              <Tooltip
                formatter={(v, _n, p) => [`${v}% (${(p.payload as { dettaglio: string }).dettaglio})`, 'In tempo']}
                contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border-default)', fontSize: 12 }}
              />
              <Line type='monotone' dataKey='quota' stroke='var(--color-action-primary)' strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Riquadro>
  );
};
