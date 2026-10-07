// Griglia dei riquadri della home (ADR055)
//
// Colonne da 320px (20rem) quante ne entrano, centrate; sotto i 320px la
// colonna si stringe alla larghezza disponibile. I riquadri tengono sempre la
// proporzione 5:4 (320x256), quindi rimpiccioliscono senza deformarsi.
// I figli sono voci <li>.
import React from 'react';

import { cn } from '../../../utils';

interface HomeTileGridProps {
  children: React.ReactNode;
  className?: string;
}

const HomeTileGrid: React.FC<HomeTileGridProps> = ({ children, className }) => (
  <ul
    className={cn(
      'grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),20rem))] justify-center gap-6',
      className
    )}
  >
    {children}
  </ul>
);

export default HomeTileGrid;
