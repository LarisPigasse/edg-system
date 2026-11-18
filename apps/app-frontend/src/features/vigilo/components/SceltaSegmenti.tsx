// src/features/vigilo/components/SceltaSegmenti.tsx
//
// Una scelta fra poche voci in un gruppo di pulsanti (es. Trasporto / Lavoro,
// Mese per mese / Cumulato): la voce scelta è piena, nel colore del modulo.
// Comune a Vigilo (2026-11-17).
import { cn } from '@edg/ui';

interface Props<T extends string> {
  voci: { value: T; label: string }[];
  valore: T;
  onCambia: (v: T) => void;
  /** Per i lettori di schermo */
  etichetta: string;
  className?: string;
}

export function SceltaSegmenti<T extends string>({ voci, valore, onCambia, etichetta, className }: Props<T>) {
  return (
    <div className={cn('inline-flex h-10 items-center rounded-lg border border-border-default p-0.5 text-sm', className)} role='group' aria-label={etichetta}>
      {voci.map(v => (
        <button
          key={v.value}
          type='button'
          aria-pressed={valore === v.value}
          onClick={() => onCambia(v.value)}
          className={cn('h-full rounded-md px-3 transition-colors', valore === v.value ? 'bg-action-primary text-action-primary-text' : 'text-text-secondary hover:bg-bg-hover')}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}
