// Primo riquadro della home (ADR055): nome e sottotitolo del frontend, dalla
// configurazione dell'applicazione (sigla + titolo, tagline)
import React from 'react';

import { useEdgConfig } from '../../../config';
import HomeTile from './HomeTile';
import ScaleToFit from '../custom/ScaleToFit';

const HomeAppTile: React.FC = () => {
  const { app } = useEdgConfig();

  return (
    <HomeTile tone='highlight'>
      <ScaleToFit>
        <div className='flex flex-col items-center'>
          <h1 className='leading-tight'>
            <span className='text-xl font-semibold uppercase text-text-primary sm:text-2xl'>{app.sigla}</span>
            <span className={`${app.colore} text-3xl font-bold tracking-tight sm:text-4xl`}>{app.titolo}</span>
          </h1>
          <span aria-hidden className='mt-4 block h-px w-32 bg-violet-500/70' />
          {app.tagline && <p className='mt-4 text-text-primary'>{app.tagline}</p>}
        </div>
      </ScaleToFit>
    </HomeTile>
  );
};

export default HomeAppTile;
