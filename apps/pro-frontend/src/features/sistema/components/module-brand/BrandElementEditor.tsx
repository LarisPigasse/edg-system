// Un elemento dell'identità visiva (icona, logo o titolo): scelta tra
// immagine e testo, testo e classi (ADR054). L'anteprima è in BrandPreview.
import React, { useMemo } from 'react';
import {
  Input,
  TextArea,
  RadioGroup,
  BRAND_DEFAULT_CLASSES,
  BRAND_ELEMENT_LABELS,
  BRAND_FILE_NAMES,
  brandDefaultText,
  findMissingClasses,
} from '@edg/ui';
import type { BrandElement, BrandElementConfig, BrandMode, ModuleBrandImages } from '@edg/ui';

import { BRAND_CLASSES_MAX, BRAND_TEXT_MAX, classesError } from './brandingForm';

const MODE_OPTIONS = [
  { value: 'file', label: 'Immagine' },
  { value: 'text', label: 'Testo' },
];

interface BrandElementEditorProps {
  element: BrandElement;
  moduleKey: string;
  name: string;
  config: BrandElementConfig;
  onChange: (config: BrandElementConfig) => void;
  images: ModuleBrandImages;
}

const BrandElementEditor: React.FC<BrandElementEditorProps> = ({
  element,
  moduleKey,
  name,
  config,
  onChange,
  images,
}) => {
  const { label, hint } = BRAND_ELEMENT_LABELS[element];
  const hasFile = Boolean(images[element]);
  const filePath = `src/assets/moduli/${moduleKey || '<chiave>'}/${BRAND_FILE_NAMES[element]}`;
  const missing = useMemo(() => findMissingClasses(config.classes), [config.classes]);
  const invalid = classesError(config.classes);

  const set = (patch: Partial<BrandElementConfig>) => onChange({ ...config, ...patch });

  return (
    <div className='rounded-lg border border-surface-border p-3'>
      <div className='mb-3 flex flex-wrap items-baseline justify-between gap-2'>
        <div>
          <span className='font-medium text-text-primary'>{label}</span>
          <span className='ml-2 text-xs text-text-secondary'>{hint}</span>
        </div>
        <RadioGroup
          options={MODE_OPTIONS}
          value={config.mode}
          onValueChange={v => set({ mode: v as BrandMode })}
          orientation='horizontal'
          size='sm'
          aria-label={`${label}: immagine o testo`}
        />
      </div>

      {config.mode === 'file' && (
        <p className={`mb-3 text-xs ${hasFile ? 'text-text-success' : 'text-text-warning'}`}>
          <code>{filePath}</code> {hasFile ? 'presente' : '— file mancante in questo frontend: si vede il testo'}
        </p>
      )}

      <div className='space-y-3'>
        <Input
          label='Testo'
          value={config.text ?? ''}
          onChange={e => set({ text: e.target.value })}
          maxLength={BRAND_TEXT_MAX}
          helperText={`Vuoto: "${brandDefaultText(element, name || 'Nome')}"${config.mode === 'file' ? ' — se manca l’immagine' : ''}`}
        />
        {/* Su più righe e in carattere piccolo a spaziatura fissa: le classi si
            leggono tutte; gli a capo diventano spazi al salvataggio */}
        <TextArea
          label='Classi Tailwind'
          value={config.classes ?? ''}
          onChange={e => set({ classes: e.target.value })}
          maxLength={BRAND_CLASSES_MAX}
          autoResize
          minRows={2}
          spellCheck={false}
          className='font-mono text-sm! leading-5!'
          error={invalid}
          helperText={`Vuoto: ${BRAND_DEFAULT_CLASSES[element]}`}
        />
      </div>

      {!invalid && missing.length > 0 && (
        <p className='mt-2 text-xs text-text-warning'>
          Fuori tavolozza, senza effetto finché non compaiono anche nel codice: {missing.join(', ')}
        </p>
      )}
    </div>
  );
};

export default BrandElementEditor;
