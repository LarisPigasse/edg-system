// Anteprima dell'identità visiva di un modulo (ADR054): i tre elementi
// insieme, come appaiono davvero. Il titolo nell'header, il logo al centro
// (ridotto in scala solo se non entra), l'icona a 64 e 32 px.
import React from 'react';
import { ModuleBrand, ScaleToFit } from '@edg/ui';
import type { ModuleBrandImages, ModuleBranding } from '@edg/ui';

interface BrandPreviewProps {
  name: string;
  branding: ModuleBranding;
  images: ModuleBrandImages;
}

const BrandPreview: React.FC<BrandPreviewProps> = ({ name, branding, images }) => {
  const brand = { name: name || 'Nome', branding, images };

  return (
    <div className='rounded-lg border border-surface-border p-3'>
      <div className='mb-3 text-sm font-medium text-text-primary'>Anteprima</div>

      <div className='overflow-hidden rounded-md border border-surface-border'>
        {/* Titolo: come nell'header, in alto a sinistra */}
        <div className='flex h-14 items-center overflow-hidden border-b border-surface-border bg-bg-primary px-4'>
          <ModuleBrand element='title' {...brand} />
        </div>
        {/* Logo: come al centro della home del modulo */}
        <div className='h-48 bg-surface-1 p-4'>
          <ScaleToFit>
            <ModuleBrand element='logo' {...brand} />
          </ScaleToFit>
        </div>
      </div>

      {/* Icona: le due misure in uso */}
      <div className='mt-3 flex items-center justify-center gap-4'>
        <ModuleBrand element='icon' {...brand} />
        <ModuleBrand element='icon' size='sm' {...brand} />
        <span className='text-xs text-text-secondary'>Icona a 64 e 32 px</span>
      </div>
    </div>
  );
};

export default BrandPreview;
