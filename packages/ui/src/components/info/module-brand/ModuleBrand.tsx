// Un elemento dell'identità visiva di un modulo: icona, logo o titolo (ADR054)
//
// Mostra l'immagine se il catalogo la chiede e il frontend la possiede;
// altrimenti (scelta "testo", file mancante o non caricabile) il testo con le
// sue classi. Così un modulo ha sempre un aspetto, anche appena creato.
import React, { useEffect, useState } from 'react';

import { cn } from '../../../utils';
import type { BrandElement, ModuleBrandImages, ModuleBranding } from './types';
import { BRAND_DEFAULT_CLASSES, EMPTY_BRAND_ELEMENT, brandDefaultText } from './defaults';

export type ModuleBrandSize = 'sm' | 'md';

export interface ModuleBrandProps {
  element: BrandElement;
  /** Nome del modulo: testo predefinito e testo alternativo dell'immagine */
  name: string;
  branding?: ModuleBranding | null;
  /** Immagini del modulo trovate dal frontend */
  images?: ModuleBrandImages;
  /** Solo per l'icona: sm 32px, md 64px */
  size?: ModuleBrandSize;
  className?: string;
}

const IMAGE_CLASSES: Record<BrandElement, string> = {
  icon: 'object-contain',
  logo: 'max-h-64 max-w-full object-contain',
  title: 'h-8 w-auto object-contain',
};

const ICON_SIZE: Record<ModuleBrandSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-16 w-16',
};

export const ModuleBrand: React.FC<ModuleBrandProps> = ({
  element,
  name,
  branding,
  images,
  size = 'md',
  className,
}) => {
  const config = branding?.[element] ?? EMPTY_BRAND_ELEMENT;
  const src = config.mode === 'file' ? images?.[element] : undefined;
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);

  if (src && !broken) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(IMAGE_CLASSES[element], element === 'icon' && ICON_SIZE[size], className)}
        onError={() => setBroken(true)}
      />
    );
  }

  const text = config.text?.trim() || brandDefaultText(element, name);
  const classes = config.classes?.trim() || BRAND_DEFAULT_CLASSES[element];

  if (element === 'icon') {
    // Il testo si disegna sempre a 64px e si riduce in scala: l'icona piccola
    // è identica alla grande, senza classi diverse per ogni misura.
    const box = (
      <span
        className={cn(
          'inline-flex h-16 w-16 items-center justify-center overflow-hidden leading-none select-none',
          classes
        )}
      >
        {text}
      </span>
    );
    return (
      <span role='img' aria-label={name} className={cn('inline-block shrink-0', ICON_SIZE[size], className)}>
        {size === 'sm' ? <span className='block origin-top-left scale-50'>{box}</span> : box}
      </span>
    );
  }

  return (
    <span className={cn('inline-block', element === 'title' && 'whitespace-nowrap', classes, className)}>{text}</span>
  );
};

export default ModuleBrand;
