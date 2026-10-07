// "Aspetto" di un modulo (ADR054), su due colonne:
//   sinistra  tavolozza garantita e anteprima dei tre elementi; resta ferma
//             mentre si scorre, così l'anteprima è sempre sotto gli occhi
//   destra    i comandi di icona, logo e titolo
import React from 'react';
import { BRAND_ELEMENTS, Palette } from '@edg/ui';

import BrandElementEditor from './BrandElementEditor';
import BrandPreview from './BrandPreview';
import type { BrandingForm } from './brandingForm';
import { moduleImages } from '../../../../assets/moduli';

interface BrandingEditorProps {
  moduleKey: string;
  name: string;
  value: BrandingForm;
  onChange: (value: BrandingForm) => void;
}

const PaletteCard: React.FC = () => (
  <div className='rounded-lg border border-surface-border bg-bg-secondary p-3 text-sm text-text-secondary'>
    <div className='mb-2 flex items-center gap-2 font-medium text-text-primary'>
      <Palette className='h-4 w-4 shrink-0' />
      Tavolozza garantita
    </div>
    <p className='leading-relaxed'>
      <code>text- bg- border- from- via- to-</code> con ogni colore e tonalità, <code>bg-linear-to-*</code>,{' '}
      <code>bg-clip-text</code>, dimensioni, pesi e famiglie del testo, <code>italic uppercase tracking-*</code>,{' '}
      <code>rounded-* shadow-* border-*</code>, <code>p-* px-* py-*</code>.
    </p>
    <p className='mt-2 text-xs'>
      Le altre classi funzionano solo se compaiono anche nel codice: l'editor le segnala in arancione.
    </p>
  </div>
);

const BrandingEditor: React.FC<BrandingEditorProps> = ({ moduleKey, name, value, onChange }) => {
  const images = moduleImages(moduleKey);

  return (
    <div className='grid grid-cols-1 items-start gap-4 lg:grid-cols-2'>
      <div className='space-y-4 lg:sticky lg:top-0'>
        <PaletteCard />
        <BrandPreview name={name} branding={value} images={images} />
      </div>
      <div className='space-y-4'>
        {BRAND_ELEMENTS.map(el => (
          <BrandElementEditor
            key={el}
            element={el}
            moduleKey={moduleKey}
            name={name}
            config={value[el]}
            onChange={config => onChange({ ...value, [el]: config })}
            images={images}
          />
        ))}
      </div>
    </div>
  );
};

export default BrandingEditor;
