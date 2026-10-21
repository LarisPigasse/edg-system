// packages/ui/src/components/data/month-calendar/MonthCalendar.data.ts
import type { ComponentData } from '../../../types';

export const monthCalendarData: ComponentData = {
  id: 'monthCalendar',
  title: 'MonthCalendar',
  description:
    'Calendario mensile generico: sei settimane da lunedì, mese precedente/successivo, "Oggi", giorno scelto. Il contenuto di ogni giorno lo decide chi lo usa.',
  category: 'data',
  importPath: 'import { MonthCalendar, monthRange, type MonthCalendarProps } from "@edg/ui";',
  origin: 'Custom Component',
  dependence: 'lucide-react (ChevronLeft, ChevronRight)',
  props: [
    { name: 'month', type: 'string', required: true, description: "Mese mostrato, 'AAAA-MM'." },
    { name: 'onMonthChange', type: '(month: string) => void', required: true, description: 'Frecce e "Oggi" chiedono un altro mese.' },
    { name: 'selected', type: 'string | null', description: "Giorno scelto, 'AAAA-MM-GG'." },
    { name: 'onSelect', type: '(day: string) => void', description: 'Clic su un giorno (e "Oggi").' },
    { name: 'today', type: 'string', description: "Oggi, 'AAAA-MM-GG' (predefinito: oggi nel fuso del browser)." },
    {
      name: 'renderDay',
      type: '(day, { inMonth, isToday, isSelected }) => ReactNode',
      description: 'Contenuto della cella sotto il numero (etichette, pallini, conteggi). Solo contenuto non interattivo: la cella è già un pulsante.',
    },
    { name: 'dayLabel', type: '(day: string) => string | undefined', description: 'Aggiunta all\'etichetta accessibile del giorno (es. "3 scadenze").' },
    { name: 'actions', type: 'ReactNode', description: "A destra nell'intestazione." },
    { name: 'cellClassName', type: 'string', description: "Classi delle celle (es. l'altezza minima, predefinita 64 px)." },
    { name: 'className', type: 'string', description: 'Classi del contenitore.' },
  ],
  examples: [
    {
      title: 'Mese con contenuto per giorno',
      description: 'Il periodo da chiedere al servizio è monthRange(month): dal primo all\'ultimo giorno della griglia.',
      code: `const [mese, setMese] = useState('2026-10');
const [giorno, setGiorno] = useState<string | null>(null);
const { from, to } = monthRange(mese);

<MonthCalendar
  month={mese}
  onMonthChange={setMese}
  selected={giorno}
  onSelect={setGiorno}
  renderDay={day => eventi[day]?.map(e => <span key={e.id}>{e.titolo}</span>)}
/>`,
    },
  ],
  notes:
    'Helper puri esportati: monthGrid, monthRange, monthTitle, dayTitle, addMonths, monthOf, isMonth, todayLocal. Giorni e mesi sono stringhe calcolate in UTC.',
};
