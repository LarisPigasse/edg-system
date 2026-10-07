// Riquadro di un modulo nella home (ADR055-057)
//
//   corpo  il logo al centro, ridotto in scala se non entra (mai ritoccato),
//          e sotto il sottotitolo (la descrizione del modulo)
//   piede  a sinistra la versione, a destra lo stato
//
// Lo stato decide anche l'aspetto (tabella HOME_MODULE_STATUS): attivo, prova
// e sviluppo sono riquadri accesi (con i colori del logo, sollevati al
// passaggio del mouse); non-attivo (vetrina), sospeso e scaduto sono spenti,
// in grigio come disabilitati, e fermi. La prova mostra la scadenza.
import React from 'react';

import HomeTile from '../../layout/home-tile/HomeTile';
import ScaleToFit from '../../layout/custom/ScaleToFit';
import Badge from '../../ui/badge/Badge';
import { ModuleBrand } from './ModuleBrand';
import { HOME_MODULE_STATUS, homeModuleStatusLabel, type HomeModuleStatus } from './moduleStatus';
import type { ModuleBrandImages, ModuleBranding } from './types';

export interface HomeModuleTileProps {
  name: string;
  /** Sottotitolo sotto il logo (la descrizione del modulo) */
  subtitle?: string | null;
  /** Versione, nel piede a sinistra (es. 1.2.0) */
  version?: string | null;
  /** Predefinito 'attivo' */
  status?: HomeModuleStatus;
  /** Fine del periodo (prova o attivo a tempo): compare nel badge */
  endsAt?: string | Date | null;
  branding?: ModuleBranding | null;
  images?: ModuleBrandImages;
  onClick?: () => void;
}

export const HomeModuleTile: React.FC<HomeModuleTileProps> = ({
  name,
  subtitle,
  version,
  status = 'attivo',
  endsAt,
  branding,
  images,
  onClick,
}) => {
  const { variant, usable } = HOME_MODULE_STATUS[status];

  return (
    <HomeTile
      tone={usable ? 'active' : 'muted'}
      title={name}
      onClick={onClick}
      footer={
        <div className='flex w-full min-w-0 items-center justify-between gap-2'>
          <span className='truncate tabular-nums'>{version ? `v${version}` : ''}</span>
          <Badge variant={variant} size='xs'>
            {homeModuleStatusLabel(status, endsAt)}
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
