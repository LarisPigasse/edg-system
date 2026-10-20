import React from 'react';
import { Link } from 'react-router-dom';
import { useEdgConfig } from '../../config';

interface LogoProps {
  /** Solo la sigla (es. "Edg"), per gli spazi stretti */
  compact?: boolean;
  className?: string;
}

/**
 * Il logo dell'applicazione: solo testo, sigla + nome dalla configurazione
 * (es. "Edg" + "App"). Il titolo del modulo in cui ci si trova non lo
 * sostituisce: l'header lo mostra nella seconda riga.
 */
const Logo: React.FC<LogoProps> = ({ compact = false, className = '' }) => {
  const { app } = useEdgConfig();

  return (
    <Link to='/' className={`flex items-center text-2xl font-bold transition-colors ${className}`} title={app.sigla + app.name}>
      <span className={`${app.coloreSigla} font-bold`}>{app.sigla}</span>
      {!compact && <span className={`${app.colore} font-bold`}>{app.name}</span>}
    </Link>
  );
};

export default Logo;
