// packages/ui/src/components/data/month-calendar/MonthCalendar.showcase.tsx
import React, { useState } from 'react';

import MonthCalendar from './MonthCalendar';
import { monthOf, todayLocal } from './monthCalendar.utils';
import { TitledSurface } from '../../layout';

/** Etichette d'esempio, relative a oggi: il primo, il 10 e il 20 del mese */
const esempi = (month: string): Record<string, { testo: string; classe: string }[]> => ({
  [`${month}-01`]: [{ testo: 'Revisione · Furgone 1', classe: 'bg-red-500' }],
  [`${month}-10`]: [
    { testo: 'Bollo · Autocarro 2', classe: 'bg-amber-500' },
    { testo: 'Tagliando · Furgone 1', classe: 'bg-green-500' },
  ],
  [`${month}-20`]: [
    { testo: 'RCA · Autocarro 2', classe: 'bg-green-500' },
    { testo: 'Visita medica · M. Rossi', classe: 'bg-cyan-500' },
    { testo: 'Estintori · Sede', classe: 'bg-green-500' },
    { testo: 'DURC · Azienda', classe: 'bg-green-500' },
  ],
});

export const MonthCalendarShowcase: React.FC = () => {
  const oggi = todayLocal();
  const [mese, setMese] = useState(monthOf(oggi));
  const [giorno, setGiorno] = useState<string | null>(oggi);
  const eventi = esempi(mese);

  return (
    <div className='space-y-8'>
      <TitledSurface title='Interattivo: etichette brevi, al massimo 3 per giorno' padding='lg'>
        <MonthCalendar
          month={mese}
          onMonthChange={setMese}
          selected={giorno}
          onSelect={setGiorno}
          today={oggi}
          cellClassName='min-h-24'
          dayLabel={day => (eventi[day] ? `${eventi[day].length} eventi` : undefined)}
          renderDay={day => {
            const lista = eventi[day] ?? [];
            return (
              <>
                {lista.slice(0, 3).map(e => (
                  <span key={e.testo} className={`truncate rounded px-1.5 py-0.5 text-xs font-medium text-white ${e.classe}`}>
                    {e.testo}
                  </span>
                ))}
                {lista.length > 3 && <span className='px-1 text-xs text-text-secondary'>+{lista.length - 3} altre</span>}
              </>
            );
          }}
        />
        <p className='mt-4 text-sm text-text-secondary'>Giorno scelto: {giorno ?? 'nessuno'}</p>
      </TitledSurface>
    </div>
  );
};

export default MonthCalendarShowcase;
