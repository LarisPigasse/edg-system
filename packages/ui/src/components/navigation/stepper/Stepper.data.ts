// packages/ui/src/components/navigation/stepper/Stepper.data.ts
import type { ComponentData } from '../../../types';

export const stepperData: ComponentData = {
  id: 'stepper',
  title: 'Stepper',
  description:
    "L'indicatore di una procedura a passi: passi fatti (spunta), passo corrente, passi da fare. Il contenuto dei passi resta alla pagina.",
  category: 'navigation',
  importPath: 'import { Stepper, type StepperStep } from "@edg/ui";',
  origin: 'Custom Component',
  dependence: 'lucide-react (Check)',
  props: [
    { name: 'steps', type: 'StepperStep[]', required: true, description: 'I passi: id, label e una descrizione breve facoltativa.' },
    { name: 'current', type: 'number', required: true, description: 'Indice (da 0) del passo corrente.' },
    {
      name: 'onStepClick',
      type: '(index: number) => void',
      description: 'Se presente, i passi già fatti diventano pulsanti per tornarci; i passi futuri non sono mai cliccabili.',
    },
    { name: 'className', type: 'string', description: 'Classi aggiuntive del contenitore.' },
  ],
  examples: [
    {
      title: 'Procedura in quattro passi',
      description: 'Il secondo passo è quello corrente; il primo si può riaprire.',
      code: `<Stepper
  current={1}
  onStepClick={setPasso}
  steps={[
    { id: 'settori', label: 'Settori' },
    { id: 'voci', label: 'Che cosa includere' },
    { id: 'riepilogo', label: 'Riepilogo' },
    { id: 'fatto', label: 'Fatto' },
  ]}
/>`,
    },
  ],
  notes:
    "Sugli schermi piccoli resta visibile solo l'etichetta del passo corrente. Per l'accessibilità il passo corrente ha aria-current=\"step\".",
};
