// packages/ui/src/components/navigation/stepper/Stepper.tsx
//
// Indicatore di una procedura a passi (es. la procedura di avvio di Vigilo).
// Solo l'indicatore: il contenuto di ogni passo resta alla pagina, che decide
// quando si avanza. I passi gia' fatti si possono riaprire se la pagina lo
// consente (onStepClick); quelli futuri no.
import React from 'react';

import { cn } from '../../../utils';
import { Check } from '../../../utils/icons';

export interface StepperStep {
  id: string;
  label: string;
  /** Riga breve sotto l'etichetta (nascosta sugli schermi piccoli) */
  description?: string;
}

interface StepperProps {
  steps: StepperStep[];
  /** Indice del passo corrente (da 0) */
  current: number;
  /** Riapre un passo gia' fatto; assente = indicatore non cliccabile */
  onStepClick?: (index: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, current, onStepClick, className }) => (
  <nav aria-label='Avanzamento' className={cn('w-full', className)}>
    <ol className='flex items-start gap-2'>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const clickable = done && !!onStepClick;
        const Marker = clickable ? 'button' : 'span';
        return (
          <li key={step.id} className='flex flex-1 items-start gap-2' aria-current={active ? 'step' : undefined}>
            <Marker
              {...(clickable ? { type: 'button' as const, onClick: () => onStepClick(i) } : {})}
              className={cn(
                'group flex min-w-0 flex-col items-center gap-1.5 text-center',
                clickable && 'cursor-pointer'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  done && 'border-action-primary bg-action-primary text-action-primary-text',
                  active && 'border-action-primary bg-bg-primary text-text-link',
                  !done && !active && 'border-border-default bg-bg-primary text-text-label',
                  clickable && 'group-hover:bg-action-primary-hover'
                )}
              >
                {done ? <Check className='h-4 w-4' aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  'text-xs font-medium sm:text-sm',
                  // i passi futuri restano leggibili: li distingue il cerchio, non il testo sbiadito
                  active ? 'text-text-primary' : 'text-text-secondary',
                  !active && 'hidden sm:block'
                )}
              >
                {step.label}
              </span>
              {step.description && <span className='hidden text-xs text-text-secondary md:block'>{step.description}</span>}
            </Marker>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn('mt-4 h-0.5 flex-1 rounded-full', i < current ? 'bg-action-primary' : 'bg-border-default')}
              />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Stepper;
