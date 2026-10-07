// Riquadro di un modulo nella home (ADR055-057)
//
//   corpo  il logo al centro, ridotto in scala se non entra (mai ritoccato),
//          e sotto il sottotitolo (la descrizione del modulo)
//   piede  a sinistra la versione, a destra lo stato
//
// Lo stato decide anche l'aspetto: 'attivo' e 'sviluppo' sono riquadri accesi
// (con i colori del logo, sollevati al passaggio del mouse); 'non-attivo' è un
// modulo in vetrina: spento, in grigio come disabilitato, e fermo.
import React from 'react';

import HomeTile from '../../layout/home-tile/HomeTile';
import ScaleToFit from '../../layout/custom/ScaleToFit';
import Badge from '../../ui/badge/Badge';
import type { BadgeVariant } from '../../ui/badge/Badge';
import { ModuleBrand } from './ModuleBrand';
import type { ModuleBrandImages, ModuleBranding } from './types';

export type HomeModuleStatus = 'attivo' | 'non-attivo' | 'sviluppo';

const STATUS_BADGE: Record<HomeModuleStatus, { label: string; variant: BadgeVariant }> = {
  attivo: { label: 'Attivo', variant: 'success' },
  'non-attivo': { label: 'Non attivo', variant: 'default' },
  sviluppo: { label: 'In sviluppo', variant: 'info' },
};

export interface HomeModuleTileProps {
  name: string;
  /** Sottotitolo sotto il logo (la descrizione del modulo) */
  subtitle?: string | null;
  /** Versione, nel piede a sinistra (es. 1.2.0) */
  version?: string | null;
  /** Predefinito 'attivo' */
  status?: HomeModuleStatus;
  branding?: ModuleBranding | null;
  images?: ModuleBrandImages;
  onClick?: () => void;
}

export const HomeModuleTile: React.FC<HomeModuleTileProps> = ({
  name,
  subtitle,
  version,
  status = 'attivo',
  branding,
  images,
  onClick,
}) => {
  const badge = STATUS_BADGE[status];

  return (
    <HomeTile
      tone={status === 'non-attivo' ? 'muted' : 'active'}
      title={name}
      onClick={onClick}
      footer={
        <div className='flex w-full min-w-0 items-center justify-between gap-2'>
          <span className='truncate tabular-nums'>{version ? `v${version}` : ''}</span>
          <Badge variant={badge.variant} size='xs'>
            {badge.label}
          </Badge>
        </div>
      }
    >
      <div className='flex h-full w-full min-w-0 flex-col items-center gap-2'>
        <div className='min-h-0 w-full flex-1'>
          <ScaleToFit>
            <ModuleBrand element='logo' name={name} branding={branding} images={images} />
          </ScaleToFit>
        </div>
        {subtitle && <p className='line-clamp-2 w-full text-sm leading-snug text-text-secondary'>{subtitle}</p>}
      </div>
    </HomeTile>
  );
};

export default HomeModuleTile;
