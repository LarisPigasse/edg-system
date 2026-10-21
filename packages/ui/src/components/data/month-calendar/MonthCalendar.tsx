// packages/ui/src/components/data/month-calendar/MonthCalendar.tsx
//
// Calendario mensile generico: intestazione con mese precedente/successivo e
// "Oggi", nomi dei giorni, griglia di 6 settimane da lunedì. Il contenuto di
// ogni giorno lo decide chi lo usa (renderDay): il componente non sa che cosa
// mostra (scadenze, spedizioni…). Un clic su un giorno lo sceglie.
import React from 'react';

import { cn } from '../../../utils';
import { ChevronLeft, ChevronRight } from '../../../utils/icons';
import { Button } from '../../ui';
import { addMonths, dayTitle, GIORNI_SETTIMANA, monthGrid, monthOf, monthTitle, todayLocal } from './monthCalendar.utils';

export interface MonthCalendarDayInfo {
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export interface MonthCalendarProps {
  /** Mese mostrato, 'AAAA-MM' */
  month: string;
  onMonthChange: (month: string) => void;
  /** Giorno scelto, 'AAAA-MM-GG' */
  selected?: string | null;
  onSelect?: (day: string) => void;
  /** Oggi, 'AAAA-MM-GG' (predefinito: oggi nel fuso del browser) */
  today?: string;
  /** Contenuto della cella, sotto il numero del giorno */
  renderDay?: (day: string, info: MonthCalendarDayInfo) => React.ReactNode;
  /** Testo aggiunto all'etichetta accessibile del giorno (es. "3 scadenze") */
  dayLabel?: (day: string) => string | undefined;
  /** A destra nell'intestazione (es. un conteggio, un collegamento) */
  actions?: React.ReactNode;
  /** Classi delle celle (es. l'altezza minima) */
  cellClassName?: string;
  className?: string;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({
  month,
  onMonthChange,
  selected,
  onSelect,
  today = todayLocal(),
  renderDay,
  dayLabel,
  actions,
  cellClassName,
  className,
}) => {
  const giorni = monthGrid(month);

  return (
    <div className={cn('w-full', className)}>
      <div className='mb-3 flex flex-wrap items-center gap-2'>
        <Button variant='secondary' size='sm' onClick={() => onMonthChange(addMonths(month, -1))} aria-label='Mese precedente'>
          <ChevronLeft className='h-4 w-4' />
        </Button>
        <h3 className='min-w-36 text-center text-base font-semibold text-text-primary' aria-live='polite'>
          {monthTitle(month)}
        </h3>
        <Button variant='secondary' size='sm' onClick={() => onMonthChange(addMonths(month, 1))} aria-label='Mese successivo'>
          <ChevronRight className='h-4 w-4' />
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            onMonthChange(monthOf(today));
            onSelect?.(today);
          }}
          disabled={month === monthOf(today) && selected === today}
        >
          Oggi
        </Button>
        {actions && <div className='ml-auto flex items-center gap-2'>{actions}</div>}
      </div>

      {/* ogni giorno è un pulsante con l'etichetta completa ("lunedì 20 ottobre 2026, …"): i nomi in testa sono solo visivi */}
      <div className='grid grid-cols-7 gap-1'>
        {GIORNI_SETTIMANA.map(g => (
          <div key={g} aria-hidden className='pb-1 text-center text-xs font-medium text-text-secondary'>
            {g}
          </div>
        ))}
        {giorni.map(day => {
          const info: MonthCalendarDayInfo = { inMonth: monthOf(day) === month, isToday: day === today, isSelected: day === selected };
          const extra = dayLabel?.(day);
          return (
            <button
              key={day}
              type='button'
              aria-pressed={info.isSelected}
              aria-label={`${dayTitle(day)}${extra ? `, ${extra}` : ''}`}
              onClick={() => onSelect?.(day)}
              className={cn(
                'flex min-h-16 min-w-0 flex-col gap-1 rounded-lg border p-1.5 text-left transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-action-primary',
                info.inMonth ? 'border-border-thin bg-bg-primary hover:bg-bg-hover' : 'border-transparent bg-bg-secondary/40 hover:bg-bg-hover',
                info.isSelected && 'border-action-primary ring-1 ring-inset ring-action-primary',
                cellClassName
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs tabular-nums',
                  info.isToday ? 'bg-action-primary font-semibold text-action-primary-text' : info.inMonth ? 'text-text-primary' : 'text-text-disabled'
                )}
              >
                {Number(day.slice(8))}
              </span>
              {renderDay && <span className='flex min-w-0 flex-col gap-0.5'>{renderDay(day, info)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;
