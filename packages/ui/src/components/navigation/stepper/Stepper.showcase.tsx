// packages/ui/src/components/navigation/stepper/Stepper.showcase.tsx
import React, { useState } from 'react';

import Stepper, { type StepperStep } from './Stepper';
import { TitledSurface } from '../../layout';
import { Button } from '../../ui';

const PASSI: StepperStep[] = [
  { id: 'settori', label: 'Settori', description: 'I modelli di settore' },
  { id: 'voci', label: 'Che cosa includere', description: 'Categorie e controlli' },
  { id: 'riepilogo', label: 'Riepilogo', description: 'Controlla e conferma' },
  { id: 'fatto', label: 'Fatto' },
];

export const StepperShowcase: React.FC = () => {
  const [passo, setPasso] = useState(1);
  return (
    <div className='space-y-8'>
      <TitledSurface title='Interattivo: i passi fatti si riaprono'>
        <div className='space-y-6 p-4'>
          <Stepper steps={PASSI} current={passo} onStepClick={setPasso} />
          <div className='flex justify-between'>
            <Button variant='secondary' disabled={passo === 0} onClick={() => setPasso(p => p - 1)}>
              Indietro
            </Button>
            <Button disabled={passo === PASSI.length - 1} onClick={() => setPasso(p => p + 1)}>
              Avanti
            </Button>
          </div>
        </div>
      </TitledSurface>
      <TitledSurface title='Solo indicatore'>
        <div className='p-4'>
          <Stepper steps={PASSI} current={3} />
        </div>
      </TitledSurface>
    </div>
  );
};

export default StepperShowcase;
