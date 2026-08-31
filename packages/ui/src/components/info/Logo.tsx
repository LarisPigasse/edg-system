import React from 'react';
import { Link } from 'react-router-dom';
import { useThemedImage } from '../../hooks/';
import { useEdgConfig } from '../../config';

interface LogoProps {
  compact?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ compact = false, className = '' }) => {
  const { app } = useEdgConfig();
  const iconSrc = useThemedImage(app.icon ?? 'icon');

  if (compact) {
    // Versione compatta - solo icona
    return (
      <Link
        to='/'
        className={`flex items-center text-2xl font-bold transition-colors ${className}`}
        title={app.sigla + app.name}
      >
        <img
          src={iconSrc}
          alt='Icon logo'
          className='w-6 h-6 mr-2 transition-opacity duration-200'
          onError={e => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </Link>
    );
  }

  // Versione completa - icona + testo
  return (
    <Link to='/' className={`flex items-center text-2xl font-bold transition-colors ${className}`}>
      <img
        src={iconSrc}
        alt='Icon logo'
        className='w-6 h-6 mr-2 transition-opacity duration-200'
        onError={e => {
          e.currentTarget.style.display = 'none';
        }}
      />
      {/* Nome dell'applicazione, fornito dalla configurazione */}
      <span className={`${app.coloreSigla} font-bold`}>{app.sigla}</span>
      <span className={`${app.colore} font-bold`}>{app.name}</span>
    </Link>
  );
};

export default Logo;
